import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  Dimensions,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import Cards from '~/components/Shared/Cards';
import { useAnnouncementData } from '~/hooks/query/useAnnouncementData';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  image_url?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 200;
const ITEM_WIDTH = SCREEN_WIDTH - 64;

const AnnouncementCard = ({ item, onPress }: { item: AnnouncementItem; onPress: () => void }) => (
  <Pressable onPress={onPress} className="mx-2">
    <Cards
      className="overflow-hidden rounded-2xl"
      style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
      title={item.title}
      content=""
      date={new Date(item.created_at)}>
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          className="h-4/5 w-full"
          resizeMode="contain"
          accessibilityLabel={`Image for ${item.title}`}
        />
      )}
      {/* <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-2">
        <Text className="text-white">
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View> */}
    </Cards>
  </Pressable>
);

const AnnouncementDetailsModal = ({
  visible,
  item,
  onClose,
}: {
  visible: boolean;
  item?: AnnouncementItem;
  onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity className="flex-1 bg-black/50" onPress={onClose}>
      <View className="flex-1 items-center justify-center ">
        <Cards
          className="w-full max-w-md p-6"
          title={item?.title || ''}
          content={item?.content || ''}>
          <Text className="mb-4 text-xl font-bold">{item?.title}</Text>
          {item?.image_url && (
            <Image
              source={{ uri: item.image_url }}
              className="mb-4 h-48 w-full rounded-lg"
              resizeMode="cover"
            />
          )}
          <Text className="mb-4 text-gray-600">{item?.content}</Text>

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 self-end rounded bg-blue-500 px-4 py-2">
            <Text className="text-white">Close</Text>
          </TouchableOpacity>
        </Cards>
      </View>
    </TouchableOpacity>
  </Modal>
);

const Announcements = () => {
  const { data: announcements = [] } = useAnnouncementData();

  // Sort and limit to 10 most recent
  const sortedAnnouncements = useMemo(() => announcements.slice(0, 10), [announcements]);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | undefined>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Auto-scroll logic with smooth infinite loop
  useEffect(() => {
    if (sortedAnnouncements.length <= 1) return;

    const startAutoPlay = () => {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % sortedAnnouncements.length);
      }, 3000); // 3 seconds per slide
    };

    if (isAutoPlaying) {
      startAutoPlay();
    }

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, sortedAnnouncements.length]);

  // Smooth scroll animation
  useEffect(() => {
    if (sortedAnnouncements.length === 0) return;

    Animated.timing(scrollAnim, {
      toValue: activeIndex,
      duration: 500, // Smoother transition
      useNativeDriver: true,
    }).start();

    flatListRef.current?.scrollToIndex({
      index: activeIndex,
      animated: true,
      viewPosition: 0.5, // Center the active item
    });
  }, [activeIndex, sortedAnnouncements.length]);

  // Handle user interaction
  const handlePress = (item: AnnouncementItem) => {
    setIsAutoPlaying(false);
    setSelectedAnnouncement(item);
    resetAutoPlay();
  };

  // Reset auto-play after 3 seconds of inactivity
  const resetAutoPlay = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (sortedAnnouncements.length > 1) {
        setIsAutoPlaying(true);
      }
    }, 3000);
  };

  // Handle momentum scroll end for manual control
  const handleMomentumScrollEnd = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / (ITEM_WIDTH + 16));
    if (newIndex !== activeIndex) {
      setIsAutoPlaying(false);
      setActiveIndex(newIndex);
      resetAutoPlay();
    }
  };

  // Add pagination dots
  const renderPagination = () => (
    <View className="absolute bottom-2 left-0 right-0 flex-row justify-center">
      {sortedAnnouncements.map((_, index) => (
        <View
          key={index}
          className={`mx-1 h-2 w-2 rounded-full ${
            index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </View>
  );

  return (
    <View className="my-4">
      <Text className="mx-4 mb-2 text-xl font-bold">Latest Updates</Text>

      <View className="relative">
        <FlatList
          ref={flatListRef}
          data={sortedAnnouncements}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <AnnouncementCard item={item} onPress={() => handlePress(item)} />
          )}
          keyExtractor={(item) => item.id}
          snapToInterval={ITEM_WIDTH + 16}
          decelerationRate="normal" // Smoother deceleration
          contentContainerClassName="px-4"
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH + 16,
            offset: (ITEM_WIDTH + 16) * index,
            index,
          })}
        />
        {sortedAnnouncements.length > 1 && renderPagination()}
      </View>

      <AnnouncementDetailsModal
        visible={!!selectedAnnouncement}
        item={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(undefined)}
      />
    </View>
  );
};

export default React.memo(Announcements);
