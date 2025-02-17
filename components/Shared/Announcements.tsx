import React from 'react';
import { FlatList, FlatListProps, View, Text } from 'react-native';
import Card from '~/components/Shared/Cards';
import { useAnnouncementData } from '~/hooks/query/useAnnouncementData';

const IMAGE_HEIGHT = 200;

// Pre-calculate item layout dimensions
const ITEM_HEIGHT = IMAGE_HEIGHT + 120; // Adjust based on your card height
const getItemLayout: FlatListProps<any>['getItemLayout'] = (_, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const Announcements = () => {
  const { data: announcements, isLoading } = useAnnouncementData();

  return (
    <View className=" my-2  rounded-xl ">
      <FlatList
        data={announcements}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <Card
              title={item.title}
              content={item.content}
              date={new Date(item.created_at)}
              imageUrl={item.image_url}
            />
          );
        }}
        keyExtractor={(item) => item.id}
        getItemLayout={getItemLayout}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default Announcements;
