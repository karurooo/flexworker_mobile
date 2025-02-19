import { router } from 'expo-router';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Button from '~/components/Shared/Buttons/Button';
import { Container } from '~/components/Shared/Container';
import { useUserStore } from '~/store/users';
import Alert from '~/components/Shared/Alerts';

export default function LandingPage() {
  const { sessionError, setSessionError } = useUserStore();

  return (
    <Container>
      <View className="h-1/2 bg-navy  ">
        <View className="h-full  w-full rounded-br-[75px] bg-white ">
          <Image
            key="landing-image"
            source={require('~/assets/images/landing-image.png')}
            className="z-10  h-full w-full  "
          />
          <Image
            key="flexworker-icon"
            source={require('~/assets/images/flexworker-icon.png')}
            className="absolute left-1/2 top-1/4 h-28 w-28 -translate-x-1/2 transform"
          />
        </View>
      </View>
      <View className="h-1/2 w-full bg-white ">
        <View className="h-full w-full justify-around rounded-tl-[75px] bg-navy  px-2">
          <View className="  h-2/3 w-full gap-3 rounded-xl  ">
            <Text className="font-Poppins text-center text-3xl font-bold text-white">
              Hail the perfect <Text className="text-primary">job</Text> and perfect
              <Text className="text-primary"> worker</Text>
            </Text>
            <Text className="font-Poppins my-2 text-center text-lg leading-6 text-white">
              Connecting Blue-Collar Workers, Skilled Professionals, and TVET Students with
              Employers.
            </Text>
            <View className="w-full flex-row items-center  justify-center gap-4 border-white  px-4 ">
              <Button
                variant="secondary"
                title="Get Started"
                onPress={() => {
                  router.push('/auth/signup');
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {sessionError && (
        <Alert
          variant="error"
          title="Session Expired"
          message="Your session has expired. Please log in again to continue."
          isVisible={sessionError}
          onClose={() => setSessionError(false)}
          onConfirm={() => {
            setSessionError(false);
            router.push('/auth/signin');
          }}
        />
      )}
    </Container>
  );
}
