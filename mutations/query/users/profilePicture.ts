import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/services/supabase';
import { useUserStore } from '~/store/users';
import { USER_QUERY_KEY } from '~/hooks/query/useUserData'; // Use the exported constant

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore.getState().authID;

  return useMutation({
    mutationFn: async (profile_picture: string) => {
      if (!userId) throw new Error('No user ID available');

      const { data, error } = await supabase
        .from('users')
        .update({ profile_picture })
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      if (!data) {
        console.error('No data returned for user ID:', userId);
        throw new Error('Profile picture update failed - check server logs');
      }

      return data;
    },
    onMutate: async (newProfilePicture) => {
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEY });

      const previousUserData = queryClient.getQueryData(USER_QUERY_KEY);

      queryClient.setQueryData(USER_QUERY_KEY, (old: any) => ({
        ...old,
        profile_picture: newProfilePicture,
      }));

      return { previousUserData };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(USER_QUERY_KEY, context?.previousUserData);
      console.error('Mutation error:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });
};
