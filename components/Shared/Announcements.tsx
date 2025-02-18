import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Dimensions,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | undefined>();

  return (
    <View className="my-4">
      <Text className="mx-4 mb-2 text-xl font-bold">Latest Updates</Text>

      <FlatList
        data={announcements}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <AnnouncementCard item={item} onPress={() => setSelectedAnnouncement(item)} />
        )}
        keyExtractor={(item) => item.id}
        snapToInterval={ITEM_WIDTH + 16}
        decelerationRate="fast"
        contentContainerClassName="px-4"
      />

      <AnnouncementDetailsModal
        visible={!!selectedAnnouncement}
        item={selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(undefined)}
      />
    </View>
  );
};

export default React.memo(Announcements);