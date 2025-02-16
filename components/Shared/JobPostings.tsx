import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Alert from './Alerts';
import { AntDesign } from '@expo/vector-icons';

interface JobPostingCardProps {
  id: string;
  company_name?: string;
  job_industry?: string;
  created_at?: string;
  salary_type?: string;
  min_salary?: number;
  max_salary?: number;
  company_logo?: string;
  onPress?: () => void;
}

const JobPostingCard = React.memo(
  ({
    id,
    company_name,
    job_industry,
    created_at,
    salary_type,
    min_salary,
    max_salary,
    company_logo,

    onPress,
  }: JobPostingCardProps) => {
    const [imageLoadError, setImageLoadError] = React.useState(false);

    // Memoize formatted date and salary values
    const formattedDate = React.useMemo(() => {
      if (!created_at) return 'No date available';
      return new Date(created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }, [created_at]);

    const salaryRange = React.useMemo(() => {
      const min = min_salary?.toLocaleString() || '0';
      const max = max_salary?.toLocaleString() || '0';
      return `₱${min} - ₱${max}`;
    }, [min_salary, max_salary]);

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.duration(250)}
        className="mx-2 my-2">
        <TouchableOpacity
          className="flex-row items-center rounded-lg border bg-white p-4"
          activeOpacity={0.9}
          onPress={onPress}
          accessibilityLabel={`Job posting at ${company_name}`}>
          {/* Company Logo */}
          {company_logo && (
            <Image
              className="mr-4 h-16 w-16 rounded-full"
              source={{ uri: company_logo }}
              placeholder={require('~/assets/images/user-placeholder.png')}
              contentFit="cover"
              transition={300}
              onError={() => setImageLoadError(true)}
              onLoad={() => setImageLoadError(false)}
              cachePolicy="disk"
              recyclingKey={`company-logo-${id}`}
              priority="low"
            />
          )}

          {/* Job Details */}
          <View className="flex-1">
            <Text className="mb-1 text-lg font-bold" numberOfLines={1}>
              {company_name || 'No Company Name'}
            </Text>

            <View className="flex-row flex-wrap gap-x-2">
              <Text className="text-sm text-gray-600">{job_industry || 'No Industry'}</Text>
              <Text className="text-sm text-gray-600">•</Text>
              <Text className="text-sm text-gray-600">{salary_type || 'No Salary Type'}</Text>
            </View>

            <View className="mt-2 flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-500">Posted: {formattedDate}</Text>
                <Text className="text-primary text-sm font-semibold">{salaryRange}</Text>
              </View>
              <AntDesign name="right" size={20} color="#6b7280" />
            </View>
          </View>
        </TouchableOpacity>

        {imageLoadError && (
          <Alert
            variant="error"
            title="Company Logo Failed to Load"
            message="We couldn't load the company logo"
            isVisible={imageLoadError}
            onClose={() => setImageLoadError(false)}
          />
        )}
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.company_name === next.company_name &&
    prev.job_industry === next.job_industry &&
    prev.created_at === next.created_at &&
    prev.salary_type === next.salary_type &&
    prev.min_salary === next.min_salary &&
    prev.max_salary === next.max_salary &&
    prev.company_logo === next.company_logo
);

export default JobPostingCard;
