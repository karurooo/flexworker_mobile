import React, { useEffect, useState } from 'react';
import { View, Text, Image, Animated } from 'react-native';

const SplashScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center">
        <View className="w-full   flex-row  items-center  ">
          <Image
            source={require('~/assets/images/flexworker-icon.png')}
            className="mx-2 h-32 w-32"
          />
          <View className="mt-2 w-1/2 ">
            <View className=" mb-1  ">
              <Image
                source={require('~/assets/images/flexworker-text.png')}
                className="h-16 w-full  "
              />
            </View>
            <Text className="font-Poppins ml-1 font-bold leading-4 text-black">
              Hail the Perfect Job, {'\n'}
              Hire the Perfect Worker
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
