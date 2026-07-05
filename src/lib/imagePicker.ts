import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  base64: string;
  mimeType: string;
}

export async function pickImageFromCamera(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets[0]?.base64) return null;

  const asset = result.assets[0];
  const base64 = asset.base64;
  if (!base64) return null;

  return {
    uri: asset.uri,
    base64,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

export async function pickImageFromLibrary(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets[0]?.base64) return null;

  const asset = result.assets[0];
  const base64 = asset.base64;
  if (!base64) return null;

  return {
    uri: asset.uri,
    base64,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}
