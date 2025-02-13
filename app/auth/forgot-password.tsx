import { View, Text } from 'react-native';
import { Container } from '~/components/Shared/Container';
export default function ForgotPassword() {
  return (
    <Container scrollable={true}>
      <View className="mt-4 items-center justify-center">
        <Text className="text-3xl font-bold text-white">Forgot Password</Text>
      </View>
    </Container>
  );
}
