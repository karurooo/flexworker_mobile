import React, { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, View, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import JobPostingCard from '~/components/Shared/JobPostings';
import { getMatchedJobs } from '~/services/api/jobseekers/jobsDataApi';
import Alert from '~/components/Shared/Alerts';
import Button from '~/components/Shared/Buttons/Button';
import { JobPost } from '~/types/employers';
import { useUserData } from '~/hooks/query/useUserData';
import { Card, useTheme, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { FontAwesome6 } from '@expo/vector-icons';
import JobDetailsModal from '~/components/Shared/JobPostDetails';
import SearchBar from '~/components/Shared/Search'; // Import the SearchBar component
import { useMatchJobs } from '~/hooks/query/useJobData';

const ITEM_HEIGHT = 250; // Pre-calculated item height
interface JobItem extends JobPost {
  company_logo?: string;
}
const formatLocation = (location: string | object) => {
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location;
    // Standard format for administrative divisions
    const parts = [
      loc.region,
      loc.province,
      loc.city,
      loc.barangay,
      loc.street,
      loc.zipCode ? ` ${loc.zipCode}` : null,
    ].filter(Boolean);
    const formatted = parts.join(', ').replace(/, (\d)/, ' $1');
    return formatted || 'Location available upon application';
  } catch (e) {
    return typeof location === 'string' ? location : 'Location available upon application';
  }
};

interface MatchedJobsListProps {
  selectedIndustry?: string;
}

const MatchedJobsList = memo(({ selectedIndustry }: MatchedJobsListProps) => {
  const { data: userData } = useUserData();
  const userId = userData?.id ?? '';
  const theme = useTheme();
  const [selectedJob, setSelectedJob] = React.useState<JobPost | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state

  const handleJobPress = useCallback((job: JobPost) => {
    setSelectedJob(job);
    setModalVisible(true);
  }, []);

  // Use the hook with the selectedIndustry
  const { data, isLoading, isError, refetch } = useMatchJobs(selectedIndustry);

  // Filter jobs based on the search query
  const filteredJobs = useMemo(() => {
    if (!data) return [];
    return data.filter((job) => job.job_title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, searchQuery]);

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
              {/* Title */}
              <View className="flex-1 flex-row ">
                <View className="">
                  <Text
                    style={theme.fonts.titleMedium}
                    numberOfLines={2}
                    className="font-bold text-gray-900">
                    {item.job_title}
                  </Text>
                  <Text style={theme.fonts.labelSmall} className="text-primary  font-medium">
                    {item.job_industry} ({item.job_type})
                  </Text>
                </View>
              </View>
              <Text style={theme.fonts.bodySmall} className="text-gray-500">
                {formatLocation(item.location || '')}
              </Text>
              {/* Content */}
              <Text style={theme.fonts.bodyMedium} className="leading-5  text-gray-800">
                {(item.description?.slice(0, 150) || '') +
                  (item.description && item.description.length > 150 ? '...' : '')}
              </Text>
              <View className=" w-full flex-1 flex-row items-center justify-between  ">
                {/* Salary */}
                {item.salary_type && (
                  <Text style={theme.fonts.labelSmall} className="text-primary font-medium">
                    <FontAwesome6 name="peso-sign" size={10} color="black" /> {item.min_salary} -{' '}
                    {item.max_salary} ({item.salary_type})
                  </Text>
                )}
                {/* Date */}
                <Text style={theme.fonts.labelSmall} className="  text-gray-500">
                  Posted:{' '}
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    ),
    [handleJobPress]
  );

  const keyExtractor = useCallback(
    (item: JobPost) => item?.id?.toString() || Math.random().toString(),
    []
  );

  if (isLoading)
    return (
      <View className="p-4">
        <Text className="text-center">Loading jobs...</Text>
      </View>
    );

  if (isError)
    return (
      <Alert
        isVisible={isError}
        variant="error"
        title="Loading Error"
        message={'An error occurred while loading jobs'}
      />
    );

  return (
    <>
      {/* Search Bar */}
      <View className="mx-4 my-4">
        <SearchBar
          onSearch={(query) => setSearchQuery(query)} // Update search query
          placeholder="Search jobs by title..."
          debounceTime={300}
        />
      </View>

      {/* Industry Indicator */}
      {selectedIndustry && (
        <View className="mx-4 mb-2">
          <Text className="text-primary font-medium">Showing jobs in: {selectedIndustry}</Text>
        </View>
      )}

      {/* Jobs List */}
      <FlatList
        data={filteredJobs} // Use filtered jobs instead of raw data
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: 112,
          offset: 112 * index,
          index,
        })}
        ListEmptyComponent={
          <View className="items-center p-4">
            <Text className="text-gray-500">
              {searchQuery
                ? 'No matching jobs found'
                : selectedIndustry
                  ? `No jobs found in ${selectedIndustry}`
                  : 'No jobs available'}
            </Text>
            <Button title="Refresh" onPress={() => refetch()} className="mt-4" />
          </View>
        }
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        job={selectedJob}
      />
    </>
  );
});
export default MatchedJobsList;
