import React, { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, useTheme, Text, Avatar } from 'react-native-paper';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Alert from './Alerts';
import { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

// Memoize constant values outside component
const CONTENT_TRUNCATE_LENGTH = 100;
const MAX_LINES = 4;
const LINE_HEIGHT = 10;
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT;

interface CardsProps {
  title: string;
  content: string;
  date: Date;
  imageUrl?: string;
  onPress?: () => void;
}

const Cards = React.memo(
  ({ title, content, date, imageUrl, onPress }: CardsProps) => {
    const theme = useTheme();
    const [expanded, setExpanded] = React.useState(false);
    const [imageLoadError, setImageLoadError] = React.useState(false);
    const [needsTruncation, setNeedsTruncation] = React.useState(false);

    // Memoize truncated content
    const truncatedContent = React.useMemo(
      () =>
        content.slice(0, CONTENT_TRUNCATE_LENGTH) +
        (content.length > CONTENT_TRUNCATE_LENGTH ? '...' : ''),
      [content]
    );

    // Measure text content height
    const handleTextLayout = useCallback((e: NativeSyntheticEvent<TextLayoutEventData>) => {
      const contentHeight = e.nativeEvent.lines.reduce((acc, line) => acc + line.height, 0);
      setNeedsTruncation(contentHeight > MAX_HEIGHT);
    }, []);

    const handlePress = React.useCallback(() => {
      setExpanded((prev) => !prev);
      onPress?.();
    }, [onPress]);
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.duration(250)}
        className="mx-2 my-1">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          accessibilityLabel={`Announcement card: ${title}`}
          accessibilityRole="button">
          <Card
            className=" overflow-hidden rounded-xl shadow-md "
            style={{
              backgroundColor: theme.colors.surface,
              minHeight: 100, // Minimum card height
            }}>
            {/* Unread Indicator */}

            {/* Card Content */}
            <Card.Content className="p-4">
              {/* Title */}
              <View className="">
                {/* <Text variant="titleMedium" numberOfLines={2} className="font-bold text-gray-900">
                  {title}
                </Text> */}

                {/* Date and Time */}
                <Text variant="titleSmall" className="">
                  {date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })}{' '}
                  |{' '}
                  {date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>

              {/* <View className="relative h-40 w-full flex-1 overflow-hidden rounded-lg ">
                {imageUrl ? (
                  <Image
                    className="h-1/2 w-1/2 border"
                    source={{ uri: imageUrl }}
                    placeholder={require('~/assets/images/user-placeholder.png')}
                    contentFit="fill"
                    transition={300}
                    accessibilityIgnoresInvertColors
                    onError={(e) => {
                      console.error('Image load failed:', {
                        uri: imageUrl,
                        error: e.error || 'Unknown error',
                      });
                      setImageLoadError(true);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', imageUrl);
                      setImageLoadError(false);
                    }}
                    cachePolicy="disk"
                    recyclingKey={imageUrl ? `image-${imageUrl}` : undefined}
                  />
                ) : (
                  <View className="flex h-full w-full items-center justify-center bg-gray-200">
                    <Text className="text-gray-500">No image available</Text>
                  </View>
                )}
              </View> */}

              {/* Content with fixed height */}
              <Animated.View
                style={{
                  maxHeight: expanded ? undefined : MAX_HEIGHT,
                  overflow: 'hidden',
                }}>
                <Text
                  variant="bodyMedium"
                  className="leading-5 text-gray-800"
                  numberOfLines={expanded ? undefined : MAX_LINES}
                  onTextLayout={handleTextLayout}>
                  {expanded ? content : truncatedContent}
                </Text>
              </Animated.View>

              {/* See More/Less Button */}
              {needsTruncation && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)} className="mt-2">
                  <Text
                    variant="labelSmall"
                    className="text-primary font-medium"
                    style={{ color: theme.colors.primary }}>
                    {expanded ? 'See Less' : 'See More'}
                  </Text>
                </TouchableOpacity>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>

        {/* Error Alert */}
        {imageLoadError && (
          <Alert
            variant="error"
            title="Image Load Failed"
            message="Failed to load image. Please check your internet connection."
            isVisible={imageLoadError}
            onClose={() => setImageLoadError(false)}
          />
        )}
      </Animated.View>
    );
  },
  (prev, next) =>
    prev.title === next.title &&
    prev.content === next.content &&
    prev.date === next.date &&
    prev.imageUrl === next.imageUrl
);

export default Cards;
