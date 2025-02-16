import { Text, View, Image } from 'react-native';

const Header = () => {
  return (
    <View className="h-32 w-full flex-row items-center justify-center gap-4  pb-3">
      <View className="h-18 w-18 flex-row items-center justify-center rounded-full bg-white p-2 ">
        <Image source={require('~/assets/images/flexworker-icon.png')} className="h-14 w-14 " />
      </View>
      <View className=" w-1/2 ">
        <Image source={require('~/assets/images/flexworker-text.png')} className="h-16 w-4/5   " />
        <Text className="font-Poppins ml-1  text-xs font-bold  leading-4 text-white">
          Hail the Perfect Job, {'\n'}
          Hire the Perfect Worker
        </Text>
      </View>
    </View>
  );
};

export default Header;
