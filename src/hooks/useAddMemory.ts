import { useMutation, useQueryClient } from '@tanstack/react-query';
import { journalRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';

export interface AddMemoryInput {
  childId: string;
  activityId: string;
  beforePhotoKey?: string | null;
  afterPhotoKey?: string | null;
  childComment?: string | null;
  learningNote?: string | null;
}

export function useAddMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddMemoryInput) =>
      journalRepo.addJournalEntry({
        assignmentId: null,
        childId: input.childId,
        activityId: input.activityId,
        beforePhotoKey: input.beforePhotoKey ?? null,
        afterPhotoKey: input.afterPhotoKey ?? null,
        childComment: input.childComment ?? null,
        learningNote: input.learningNote ?? null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.journal(LOCAL_FAMILY_ID) }),
  });
}
