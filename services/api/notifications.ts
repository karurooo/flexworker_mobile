import { supabase } from '~/services/supabase';
import { useNotificationStore } from '~/store/notifications';
import { JobPost } from '~/types/employers';
import { Notification } from '~/types/notifications';
import { userDataApi } from './users/userDataApi';
import { getEmployerData } from './employers/employerDataApi';
import { JobSeeker, JobSeekerProfile } from '~/types/jobseeker';
import { Employer } from '~/types/employers';
import { User } from '~/types/users';

const NOTIFICATION_LIMIT = 20; // Optimize initial load

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

  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => callback(payload.new)
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
            senderName: `${applicantProfile.personal_information?.first_name} ${applicantProfile.personal_information?.last_name}`,
            applicantProfile: applicantProfile,
            employer: jobPost,
            jobId: jobPost.id,
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
    applicantId: string;
    jobId: string;
    decision: 'Approved' | 'Rejected';
    employer: User;
  }) => {
    try {
      // 1. First update application status
      const { error: updateError } = await supabase
        .from('applied_job')
        .update({ status: params.decision })
        .eq('job_seeker_id', params.applicantId)
        .eq('job_posting_id', params.jobId);

      if (updateError) throw updateError;

      // 2. Then attempt notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            receiver_id: params.applicantId,
            sender_id: params.employer.id,
            type: 'application_update',
            title: params.decision === 'Approved' ? 'Application Accepted' : 'Application Rejected',
            message:
              params.decision === 'Approved'
                ? `Congratulations! You've been hired for the position by ${params.employer?.company_name}`
                : `Your application was not selected by ${params.employer?.company_name}`,
            metadata: {
              jobId: params.jobId,
              decision: params.decision,
              employer: {
                id: params.employer.id,
                name: params.employer.contact_person,
                company: params.employer.company_name,
              },
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
};
