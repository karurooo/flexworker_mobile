import { View, Text, Button, Image } from 'react-native';
import { Container } from '~/components/Shared/Container';
import { imageUtils } from '~/utils/pickImages';
import CameraCapture from '~/components/Shared/CameraCapture';
import Header from '~/components/Shared/Header';
import { useState } from 'react';
import { useAnnouncementData } from '~/hooks/query/useAnnouncementData';
import Announcements from '~/components/Shared/Announcements';
import AllPostedJobs from '~/components/Employer/AllPostedJobs';
import SecondaryButtons from '~/components/Shared/Buttons/SecondaryButton';
import { set } from 'lodash';
import PrimaryModal from '~/components/Shared/Modal/PrimaryModal';
import React from 'react';

export default function Home() {
  const [visible, setVisible] = useState(false);
  const handlePickImage = async () => {
    try {
      const { pickImage } = imageUtils();
      const result = await pickImage();

      if (result.canceled) {
        console.log('User canceled image selection');
        return;
      }

      // Handle successful image selection
      console.log('Selected image:', result.assets[0].uri);
    } catch (error) {
      console.error('Image picker error:', error);
      // Show error to user
    }
  };
  const handleShowModal = () => setVisible(true);

  return (
    <Container>
      <View className="h-[15%] bg-white">
        <View className="h-full justify-center rounded-br-[75px] bg-navy px-4">
          <Header />
        </View>
      </View>
      <View className="mx-4 h-[85%] flex-1">
        <SecondaryButtons
          title="View Announcements"
          onPress={() => {
            setVisible(true);
          }}
        />
        {visible && (
          <PrimaryModal visible={visible} onClose={() => setVisible(false)}>
            <>
              <Text className=" text-2xl font-bold">Announcements</Text>
              <Announcements />
            </>
          </PrimaryModal>
        )}
        <AllPostedJobs />
      </View>
    </Container>
  );
}
