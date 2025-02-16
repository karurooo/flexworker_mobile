import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Card, useTheme, Text } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';
import { JobPost } from '~/types/employers';
import JobDetailsModal, { formatLocation } from '~/components/Shared/JobPostDetails';
import Alerts from '~/components/Shared/Alerts';
import { getAllJobPosts } from '~/services/api/employers/jobPostDataApi';
import PostDetail from './PostDetail';

const ITEM_HEIGHT = 150;
const PAGE_SIZE = 10;

const useAllJobs = () => {
  const [page, setPage] = React.useState(1);
  const [combinedData, setCombinedData] = React.useState<JobPost[]>([]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['allJobs', page],
    queryFn: () => getAllJobPosts(page, PAGE_SIZE),
    staleTime: 1000 * 60 * 5,
  });

  React.useEffect(() => {
    if (data?.length) {
      setCombinedData((prev) => [...new Set([...prev, ...data])]);
    }
  }, [data]);

  const loadMore = React.useCallback(() => {
    if (!isFetching && data?.length === PAGE_SIZE) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, data?.length]);

  return {
    data: combinedData,
    isLoading,
    isError,
    error,
    isFetching,
    loadMore,
    hasMore: data?.length === PAGE_SIZE,
  };
};

const JobItem = memo(({ item, onPress }: { item: JobPost; onPress: (job: JobPost) => void }) => (
  <Animated.View
    entering={FadeIn.duration(300)}
    exiting={FadeOut.duration(200)}
    layout={LinearTransition.duration(250)}
    className="mx-2 my-1">
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      accessibilityLabel={`Job posting: ${item.job_title}`}>
      <Card className="bg-surface overflow-hidden rounded-xl shadow-md">
        <Card.Content className="p-4">
          <View className="flex-1">
            <Text className="font-bold text-gray-900" numberOfLines={2}>
              {item.job_title}
            </Text>
            <Text className="text-primary font-medium">
              {item.job_industry} • {item.job_type}
            </Text>
          </View>

          <Text className="mt-2 text-gray-500">{formatLocation(item.location)}</Text>

          <Text className="mt-2 text-gray-800" numberOfLines={3}>
            {item.description}
          </Text>

          <View className="mt-4 flex-row items-center justify-between">
            {item.salary_type && (
              <Text className="text-primary font-medium">
                <FontAwesome6 name="peso-sign" size={12} />
                {item.min_salary} - {item.max_salary} ({item.salary_type})
              </Text>
            )}
            <Text className="text-gray-500">
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
));

const AllPostedJobs = memo(() => {
  const theme = useTheme();
  const [selectedJob, setSelectedJob] = React.useState<JobPost | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const { data, isLoading, isError, loadMore, isFetching, hasMore } = useAllJobs();

  const handleJobPress = useCallback((job: JobPost) => {
    setSelectedJob(job);
    setModalVisible(true);
  }, []);

  const memoizedData = useMemo(
    () => data.filter((p: JobPost) => !!p?.id && !!p.created_at),
    [data]
  );

  const renderItem = useCallback(
    ({ item }: { item: JobPost }) => <JobItem item={item} onPress={handleJobPress} />,
    [handleJobPress]
  );

  const keyExtractor = useCallback((item: JobPost) => item.id.toString(), []);

  const ListFooter = useMemo(
    () => (
      <View className="items-center p-4">
        {isFetching ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : hasMore ? (
          <TouchableOpacity onPress={loadMore} className="bg-primary rounded-full px-4 py-2">
            <Text className="text-white">Load More</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    [isFetching, hasMore, theme.colors.primary]
  );

  if (isLoading && !data.length) {
    return (
      <View className="p-4">
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <Alerts
        isVisible={isError}
        variant="error"
        title="Loading Error"
        message="Failed to load job postings"
      />
    );
  }

  return (
    <>
      <FlatList
        data={memoizedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="items-center p-4">
            <Text className="text-gray-500">No jobs available</Text>
          </View>
        }
      />

      {/* Job Detail Modal */}
      {selectedJob && (
        <PostDetail
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          job={selectedJob}
        />
      )}
    </>
  );
});

export default AllPostedJobs;
