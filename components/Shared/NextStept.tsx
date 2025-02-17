import { View, Text } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';
import type { Notification } from '~/types/notifications';
import { memo } from 'react';

interface NextStepProps {
  status: 'accepted' | 'pending' | 'rejected';
  metadata?: Notification['metadata'];
}

const NextStep = memo(({ status, metadata }: NextStepProps) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'accepted':
        return {
          icon: 'check-circle',
          color: theme.colors.primary,
          title: 'Application Accepted!',
          steps: [
            'Contact the employer to schedule your interview',
            'Prepare required documents',
            'Confirm your availability',
          ],
        };
      case 'pending':
        return {
          icon: 'clock',
          color: theme.colors.secondary,
          title: 'Application Under Review',
          steps: [
            'Wait for employer response',
            'Check your notifications regularly',
            'Prepare supporting documents',
          ],
        };
      case 'rejected':
        return {
          icon: 'times-circle',
          color: theme.colors.error,
          title: 'Application Not Selected',
          steps: [
            'Continue exploring other opportunities',
            'Update your profile for better matches',
            'Apply to new job postings',
          ],
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="bg-surface m-4 p-4">
      <Card.Content className="space-y-4">
        <View className="flex-row items-center gap-3">
          <FontAwesome6 name={config.icon} size={24} color={config.color} />
          <Text style={theme.fonts.titleMedium} className="font-bold">
            {config.title}
          </Text>
        </View>

        {status === 'accepted' && metadata?.employer && (
          <View className="bg-primary/10 rounded-lg p-4">
            <Text style={theme.fonts.labelMedium} className="text-primary mb-2 font-semibold">
              Employer Contact:
            </Text>
            <View className="space-y-1">
              <Text className="text-gray-800">
                <FontAwesome6 name="user-tie" size={14} /> {metadata.senderName}
              </Text>
              <Text className="text-gray-800">
                <FontAwesome6 name="phone" size={14} /> {metadata.senderName}
              </Text>
              <Text className="text-gray-800">
                <FontAwesome6 name="envelope" size={14} /> {metadata.employer.experience}
              </Text>
            </View>
          </View>
        )}

        <View className="space-y-2">
          <Text style={theme.fonts.labelMedium} className="font-medium text-gray-600">
            Next Steps:
          </Text>
          {config.steps.map((step, index) => (
            <View key={index} className="flex-row items-start gap-2">
              <FontAwesome6 name="circle-info" size={14} color={theme.colors.primary} />
              <Text style={theme.fonts.bodyMedium} className="flex-1 text-gray-800">
                {step}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
});

export default NextStep;
