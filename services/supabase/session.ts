import * as SecureStore from 'expo-secure-store';

export async function setSession(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

export async function getSession(key: string) {
  return await SecureStore.getItemAsync(key);
}

export async function deleteSession(key: string) {
  await SecureStore.deleteItemAsync(key);
}
