export interface Application {
  id: string;
  created_at: string;
  job_seeker_id: string;
  job_posting_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

export type ApplicationStatus = Application['status'];
