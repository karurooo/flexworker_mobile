import { supabase } from '~/services/supabase';
import { useNotificationStore } from '~/store/notifications';
import { JobPost, JobPostWithRelations } from '~/types/employers';
import { Notification } from '~/types/notifications';
import { userDataApi } from './users/userDataApi';
import { getEmployerData } from './employers/employerDataApi';
import { JobSeeker, JobSeekerProfile, JobSeekerSkills } from '~/types/jobseeker';
import { User } from '~/types/users';
import { useJobseekerData } from '~/hooks/query/useJobSeekerData';
import { getJobseekerData } from './jobseekers/jobseekerDataApi';
import { get } from 'lodash';

const NOTIFICATION_LIMIT = 20; // Optimize initial load

export type NotificationJob = JobPostWithRelations & {
  notification_id: string;
  created_at: string;
  read: boolean;
};

interface NotificationMetadata {
  job_postings: {
    job_title: string;
    location: string;
  };
  applicantProfile: JobSeekerProfile;
  applicantSkills: JobSeekerSkills[];
  decision?: 'approved' | 'rejected';
  instructions?: string;
  rejectionReasons?: string;
}

export const NotificationService = {
  initialize: async (userId: string) => {
    const { data: notif, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });

    console.log('API Response - initialize:', { data: notif, error });
    if (error) throw error;

    if (notif) {
      useNotificationStore.getState().setNotifications(notif);
    }

    return notif;
  },

  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            useNotificationStore.getState().markAsRead(payload.new.id);
          }
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  },

  sendApplicationNotification: async (
    jobPost: JobPost,
    applicantId: string,
    applicantProfile: JobSeekerProfile
  ) => {
    if (!jobPost.id) {
      throw new Error('Job post ID is required for notifications');
    }

    console.log('jobPost:', jobPost);
    if (!jobPost.employer_id) {
      throw new Error('Job post missing employer ID');
    }

    // Add fallback to get employer's user_id from employers table
    const { data: employerData, error: employerError } = await supabase
      .from('employers')
      .select('user_id')
      .eq('id', jobPost.employer_id)
      .single();

    if (employerError || !employerData?.user_id) {
      throw new Error('Failed to resolve employer user ID');
    }

    const receiverId = jobPost.employer_user_id ?? employerData.user_id;

    const applicantSkillsData = await supabase
      .from('job_seeker_skills')
      .select('industry, specialization')
      .eq('user_id', applicantId);

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          receiver_id: receiverId,
          sender_id: applicantId,
          title: 'New Job Application',
          message: `Application received for ${jobPost.job_title} from ${applicantProfile.personal_information?.first_name} ${applicantProfile.personal_information?.last_name} - tap to review applicant's profile`,
          type: 'job_application',
          job_posting_id: jobPost.id,
          metadata: {
            job_postings: {
              job_title: jobPost.job_title,
              location: jobPost.location,
            },
            applicantProfile: {
              ...applicantProfile,
              applicantSkills: applicantSkillsData.data || [],
            },
            applicantSkills: applicantSkillsData.data || [],
          },
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data;
  },

  markAsRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) useNotificationStore.getState().markAsRead(notificationId);
  },

  sendHireDecision: async (params: {
    receiverId: string;
    applicantId: string;
    jobId: string;
    decision: 'Approved' | 'Rejected';
    employer: User;
    jobTitle: string;
    instructions?: string;
    rejectionReasons?: string;
  }) => {
    try {
      console.log('Starting hire decision:', params);

      // 1. First update application status
      const { error: updateError } = await supabase
        .from('applied_job')
        .update({ status: params.decision })
        .eq('job_seeker_id', params.applicantId)
        .eq('job_posting_id', params.jobId);

      if (updateError) throw updateError;
      const user = await userDataApi();
      const applicant = await getJobseekerData(params.applicantId);
      const employer = await getEmployerData(user.id);
      console.log('sender id', employer?.user_id);

      console.log('Creating notification with:', {
        receiver_id: params.receiverId,
        type: 'application_update',
        metadata: {
          decision: params.decision === 'Approved' ? 'accepted' : 'rejected',
          jobId: params.jobId,
          job_title: params.jobTitle,
          employer: {
            company_name: params.employer.company_name,
          },
          instructions: params.instructions,
          rejectionReasons: params.rejectionReasons,
        },
      });

      // 2. Then attempt notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            receiver_id: params.receiverId,
            sender_id: employer?.user_id,
            type: 'application_update',
            job_posting_id: params.jobId,
            title: `Application ${params.decision}`,
            message: `Your application for ${params.jobTitle} was ${params.decision}`,
            metadata: {
              decision: params.decision === 'Approved' ? 'accepted' : 'rejected',
              jobId: params.jobId,
              job_title: params.jobTitle,
              employer: {
                userId: params.employer.id,
                company_name: params.employer.company_name,
              },
              job_postings: {
                job_title: params.jobTitle,
                company_name: params.employer.company_name,
              },
              instructions: params.instructions,
              rejectionReasons: params.rejectionReasons,
            },
          },
        ])
        .select();

      if (notifError) {
        console.warn('Status updated but notification failed:', notifError);
        return { success: true, warning: 'Status updated but notification failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Full failure:', error);
      throw error;
    }
  },

  getAdminResponses: async (userId: string) => {
    if (!userId || !/^[0-9a-f-]{36}$/.test(userId)) {
      throw new Error('Invalid user session - please log in again');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', userId)
      .eq('type', 'employer_application')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Notification fetch error:', error);
      throw new Error('Failed to load notifications - please try again later');
    }

    return data;
  },

  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });

    return (
      data?.map((n) => ({
        ...n,
        metadata: n.metadata || {},
        type: n.type === 'application_update' ? n.type : 'legacy',
      })) || []
    );
  },
};
