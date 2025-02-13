import { Text, View, Image } from 'react-native';

const Header = () => {
  return (
    <View className="h-36 w-full flex-row items-center justify-center gap-4  ">
      <View className="h-24 w-24 flex-row items-center justify-center rounded-full bg-white p-2 ">
        <Image source={require('~/assets/images/flexworker-icon.png')} className="h-16 w-16 " />
      </View>
      <View className=" w-1/2 ">
        <View className=" mb-1  ">
          <Image
            source={require('~/assets/images/flexworker-text.png')}
            className="h-16 w-full  "
          />
        </View>
        <Text className="font-Poppins ml-1 font-bold leading-4 text-white">
          Hail the Perfect Job, {'\n'}
          Hire the Perfect Worker
        </Text>
      </View>
    </View>
  );
};

export default Header;
