import { useState } from 'react';
import { View, TouchableOpacity, Image, Modal } from 'react-native';
import ImageView from 'react-native-image-viewing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { imageUtils } from '~/utils/pickImages';
import { getImage } from '~/services/api/storage/getImage';
import { useUpdateProfilePicture } from '~/mutations/query/users/profilePicture';
import { useUserData } from '~/hooks/query/useUserData';
import { uploadImage } from '~/services/api/storage/uploadImage';
import { useUploadImage } from '~/hooks/query/useUpload';
import * as FileSystem from 'expo-file-system';

const ProfilePicture = () => {
  const [showImage, setShowImage] = useState(false);
  const { mutate: updateProfilePicture, isPending } = useUpdateProfilePicture();
  const placeholderImage = require('~/assets/images/user-placeholder.png');
  const { pickImage } = imageUtils();
  // Fetch user data using TanStack Query
  const { data: userData, refetch } = useUserData();
  const profile_picture = userData?.profile_picture;
  const { mutate: uploadImage, isSuccess } = useUploadImage();

  const handlePickImage = async () => {
    try {
      const result = await pickImage();

      if (result.canceled || !result.assets?.[0]?.uri) return;

      const asset = result.assets[0];
      const uri = asset.uri;

      // Validate the URI
      if (!uri.startsWith('file://')) {
        throw new Error('Invalid file URI');
      }

      // Read the file as Base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Upload the image
      uploadImage(base64, {
        onSuccess: (publicUrl) => {
          updateProfilePicture(publicUrl);
          refetch();
        },
        onError: (error) => {
          console.error('Upload error:', error);
        },
      });
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };
  // const selectImage = async () => {
  //   try {
  //     // Open image picker
  //     const pickedImage = await imageUtils().pickImage();

  //     // If the user cancels the picker, exit early
  //     if (!pickedImage) {
  //       console.log('Image selection canceled.');
  //       return;
  //     }

  //     // Get the selected image URL
  //     const imageResponse = await getImage();
  //     const publicUrl = imageResponse?.publicUrl;

  //     // Log the public URL for debugging
  //     console.log('Public URL from getImage:', publicUrl);

  //     // Validate the publicUrl
  //     const isValidImageUrl = publicUrl && /\.(jpg|jpeg|png|gif)$/i.test(publicUrl);
  //     if (!isValidImageUrl) {
  //       console.log('Invalid image URL:', publicUrl);
  //       return;
  //     }

  //     // Trigger the mutation to update the profile picture in the database
  //     updateProfilePicture(publicUrl);
  //     console.log('Image selected:', publicUrl);
  //     // Refetch user data to ensure the UI updates
  //
  //   } catch (error) {
  //     console.error('Error selecting image:', error);
  //   }
  // };

  return (
    <View className="relative h-[80px] w-[80px] flex-row items-center  justify-center gap-2 rounded-full border border-white">
      {/* Profile Picture */}
      <TouchableOpacity onPress={() => setShowImage(true)}>
        <Image
          source={
            profile_picture ? { uri: profile_picture } : placeholderImage // Use placeholder if no profile picture exists
          }
          className="h-20 w-20 rounded-full"
        />
        {/* Modal for Full-Screen Image View */}
        <Modal visible={showImage} transparent={true}>
          <ImageView
            images={[{ uri: profile_picture || placeholderImage }]} // Fallback to placeholder
            imageIndex={0}
            visible={showImage}
            onRequestClose={() => setShowImage(false)}
          />
        </Modal>
      </TouchableOpacity>

      {/* Camera Icon for Uploading */}
      <TouchableOpacity
        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border bg-white"
        onPress={handlePickImage}
        disabled={isPending} // Disable button while uploading
      >
        <FontAwesome name="camera" size={12} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

export default ProfilePicture;
