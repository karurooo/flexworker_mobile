import * as SecureStore from 'expo-secure-store';

export async function setSession(
  key: string,
  value: { access_token: string; refresh_token: string; user: { id: string } }
) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function getSession(key: string) {
  const session = await SecureStore.getItemAsync(key);
  return session ? JSON.parse(session) : null;
}

export async function deleteSession(key: string) {
  await SecureStore.deleteItemAsync(key);
}
