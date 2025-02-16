import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { FlatList, View, TouchableOpacity } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { getPostByEmployer } from '~/services/api/employers/jobPostDataApi';
import Alert from '~/components/Shared/Alerts';
import Button from '~/components/Shared/Buttons/Button';
import { JobPost } from '~/types/employers';
import { useUserData } from '~/hooks/query/useUserData';
import { Card, useTheme, Text } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';
import JobDetailsModal from '~/components/Shared/JobPostDetails';
import { formatLocation } from '~/components/Shared/JobPostDetails';
import Alerts from '~/components/Shared/Alerts';
import { useJobsData } from '~/hooks/query/useJobData';
import { usePostedJobs } from '~/hooks/query/useJobData';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import PostDetail from './PostDetail';

const ITEM_HEIGHT = 250; // Match height with MatchedJobs

const PostedJobsList = memo(() => {
  const { data: employer } = useEmployerData();
  const employerId = employer?.id;

  const { data: jobs, isPending, isError } = usePostedJobs(employerId || ''); // Handle empty case

  if (!employerId) {
    return <Text className="text-gray-500">Complete your employer profile to post jobs</Text>;
  }

  const theme = useTheme();
  const [selectedJob, setSelectedJob] = React.useState<JobPost | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const queryClient = useQueryClient();

  const memoizedData = useMemo(
    () => jobs?.filter((p: JobPost) => !!p?.id && !!p.created_at) || [],
    [jobs]
  );

  console.log('PostedJobs employerId:', employerId);
  console.log('PostedJobs data:', jobs);
  console.log('Memoized data:', memoizedData);

  const handleJobPress = useCallback((job: JobPost) => {
    setSelectedJob(job);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: JobPost }) => (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.duration(250)}
        className="mx-2 my-1">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleJobPress(item)}
          accessibilityLabel={`Job posting: ${item.job_title}`}
          accessibilityRole="button">
          <Card
            className="bg-surface overflow-hidden rounded-xl shadow-md"
            style={{ backgroundColor: theme.colors.surface }}>
            <Card.Content className="p-4">
              <View className="flex-1 flex-row">
                <View className="flex-1">
                  <Text
                    style={theme.fonts.titleMedium}
                    numberOfLines={2}
                    className="font-bold text-gray-900">
                    {item.job_title}
                  </Text>
                  <Text style={theme.fonts.labelSmall} className="text-primary font-medium">
                    {item.job_industry} • {item.job_type}
                  </Text>
                </View>
              </View>

              <Text style={theme.fonts.bodySmall} className="mt-2 text-gray-500">
                {formatLocation(item.location)}
              </Text>

              <Text style={theme.fonts.bodyMedium} className="mt-2 text-gray-800">
                {(item.description?.slice(0, 150) || '') +
                  (item.description && item.description.length > 150 ? '...' : '')}
              </Text>

              <View className="mt-4 flex-row items-center justify-between">
                {item.salary_type && (
                  <Text style={theme.fonts.labelSmall} className="text-primary font-medium">
                    <FontAwesome6 name="peso-sign" size={12} color={theme.colors.primary} />{' '}
                    {item.min_salary} - {item.max_salary} ({item.salary_type})
                  </Text>
                )}

                <Text style={theme.fonts.labelSmall} className="text-gray-500">
                  Posted:{' '}
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                  })}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    ),
    [handleJobPress, theme]
  );

  const keyExtractor = useCallback((item: JobPost) => item.id.toString(), []);

  if (isPending)
    return (
      <View className="p-4">
        <Text className="text-center">Loading your job posts...</Text>
      </View>
    );

  if (isError)
    return (
      <Alert
        isVisible={isError}
        variant="error"
        title="Loading Error"
        message="Failed to load your job postings"
      />
    );

  return (
    <>
      <FlatList
        data={memoizedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        ListEmptyComponent={
          <View className="items-center p-4">
            <Text className="text-gray-500">No jobs posted yet</Text>
          </View>
        }
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      {isError && (
        <Alerts
          isVisible={isError}
          variant="error"
          title="Loading Error"
          message="Failed to load your job postings"
        />
      )}
      <PostDetail
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        job={selectedJob}
        isEmployerView={true}
      />
    </>
  );
});

export default PostedJobsList;
