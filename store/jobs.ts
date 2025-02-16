import { create } from 'zustand';
import { JobPost } from '~/types/employers';

interface JobsState {
  jobs: JobPost[];
  loading: boolean;
  error: Error | null;
  setJobs: (jobs: JobPost[]) => void;
  fetchJobs: (userId: string) => Promise<void>;
}

export const useJobsStore = create<JobsState>((set) => ({
  jobs: [],
  loading: false,
  error: null,
  setJobs: (jobs) => set({ jobs }),
  fetchJobs: async (userId) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/jobs?userId=${userId}`);
      const data = await response.json();
      set({ jobs: data, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
}));
