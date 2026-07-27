/**
 * Photo capture for the journal. Uses expo-image-picker (camera or library).
 * Returns a local file URI stored as the journal photo key. When cloud sync is
 * on, uploadJournalPhoto pushes the file to the private Supabase 'journal'
 * bucket under families/<familyId>/... and returns the storage path.
 */
import * as ImagePicker from 'expo-image-picker';
import { getSupabase } from './supabase';
import { uuid } from '@/lib/id';

export async function pickPhoto(fromCamera = false): Promise<string | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = fromCamera
    ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
    : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

/** Upload a local photo to the private journal bucket. Returns the storage path. */
export async function uploadJournalPhoto(
  familyId: string,
  localUri: string,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return localUri; // offline / no backend: keep the local uri
  try {
    const path = `families/${familyId}/${uuid()}.jpg`;
    const res = await fetch(localUri);
    const blob = await res.blob();
    const { error } = await sb.storage.from('journal').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) return localUri;
    return path;
  } catch {
    return localUri;
  }
}
