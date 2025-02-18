import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View, Text, Dimensions } from 'react-native';
import Card from '~/components/Shared/Cards';
import { useAnnouncementData } from '~/hooks/query/useAnnouncementData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 150;
const ITEM_WIDTH = SCREEN_WIDTH - 32;

const Announcements = () => {
  const { data: announcements, isLoading } = useAnnouncementData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!announcements || announcements.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % announcements.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, announcements]);

  const getItemLayout = (_, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  const renderItem = ({ item }) => (
    <View
      className="rounded-xl overflow-hidden"
      style={{
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
      }}
    >
      <Card
        title=""
        content=""
        date={new Date(item.created_at)}
        imageUrl={item.image_url}
      />
    </View>
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className="my-2">
      <FlatList
        ref={flatListRef}
        data={announcements}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemLayout={getItemLayout}
        initialScrollIndex={currentIndex}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH
          );
          setCurrentIndex(newIndex);
        }}
      />
    </View>
  );
};

export default Announcements;