import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useActiveChild } from '@/hooks/useChildren';
import { useAddMemory } from '@/hooks/useAddMemory';
import { pickPhoto, uploadJournalPhoto } from '@/services/media';
import { Button } from '@/components/ui/Button';
import { LOCAL_FAMILY_ID } from '@/services/config';

function PhotoSlot({
  label,
  uri,
  onPress,
}: {
  label: string;
  uri: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Add ${label} photo`}
      className="flex-1 items-center justify-center overflow-hidden rounded-card bg-surface"
      style={{ height: 140, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : (
        <View className="items-center gap-1">
          <Text style={{ fontSize: 28 }}>📷</Text>
          <Text className="text-sm text-ink-soft">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function AddMemory() {
  const router = useRouter();
  const { activityId } = useLocalSearchParams<{ activityId?: string }>();
  const child = useActiveChild();
  const addMemory = useAddMemory();

  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [note, setNote] = useState('');

  const choose = async (which: 'before' | 'after') => {
    const uri = await pickPhoto(false);
    if (!uri) return;
    if (which === 'before') setBefore(uri);
    else setAfter(uri);
  };

  const save = async () => {
    if (!child) return;
    const [beforeKey, afterKey] = await Promise.all([
      before ? uploadJournalPhoto(LOCAL_FAMILY_ID, before) : Promise.resolve(null),
      after ? uploadJournalPhoto(LOCAL_FAMILY_ID, after) : Promise.resolve(null),
    ]);
    await addMemory.mutateAsync({
      childId: child.id,
      activityId: activityId ?? 'freeform',
      beforePhotoKey: beforeKey,
      afterPhotoKey: afterKey,
      childComment: comment.trim() || null,
      learningNote: note.trim() || null,
    });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="px-5 pt-4 pb-6 gap-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Add a memory</Text>
          <Text onPress={() => router.back()} className="text-base text-ink-soft" accessibilityRole="button">
            Cancel
          </Text>
        </View>

        <View className="flex-row gap-3">
          <PhotoSlot label="Before" uri={before} onPress={() => choose('before')} />
          <PhotoSlot label="After" uri={after} onPress={() => choose('after')} />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink-soft">What did they say?</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="“I made the tallest tower!”"
            placeholderTextColor="#A69F93"
            className="rounded-2xl border border-black/10 bg-surface px-4 py-3 text-base text-ink"
            multiline
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink-soft">Learning note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What they discovered or struggled with"
            placeholderTextColor="#A69F93"
            className="rounded-2xl border border-black/10 bg-surface px-4 py-3 text-base text-ink"
            multiline
          />
        </View>
      </ScrollView>
      <View className="px-5 pb-2">
        <Button
          label={addMemory.isPending ? 'Saving…' : 'Save memory'}
          onPress={save}
          disabled={addMemory.isPending || !child}
        />
      </View>
    </SafeAreaView>
  );
}
