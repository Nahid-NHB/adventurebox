/**
 * Completing an activity: records an assignment, bumps the streak, and (if
 * provided) writes a journal entry. All local + offline; invalidates the
 * queries that visibly change. In production the same writes also enqueue to
 * the sync outbox.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsRepo, streaksRepo, journalRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';
import { todayKey } from '@/lib/date';

export interface CompleteInput {
  childId: string;
  activityId: string;
  childComment?: string;
  learningNote?: string;
}

export function useCompleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CompleteInput) => {
      const assignment = await assignmentsRepo.recordAssignment({
        childId: input.childId,
        activityId: input.activityId,
        date: todayKey(),
        status: 'completed',
      });
      const streak = await streaksRepo.completeForStreak(LOCAL_FAMILY_ID);
      if (input.childComment || input.learningNote) {
        await journalRepo.addJournalEntry({
          assignmentId: assignment.id,
          childId: input.childId,
          activityId: input.activityId,
          beforePhotoKey: null,
          afterPhotoKey: null,
          childComment: input.childComment ?? null,
          learningNote: input.learningNote ?? null,
        });
      }
      return streak;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.streak(LOCAL_FAMILY_ID) });
      qc.invalidateQueries({ queryKey: qk.journal(LOCAL_FAMILY_ID) });
      qc.invalidateQueries({ queryKey: ['todaysAdventure'] });
    },
  });
}

export function useSkipActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { childId: string; activityId: string }) => {
      await assignmentsRepo.recordAssignment({
        childId: input.childId,
        activityId: input.activityId,
        date: todayKey(),
        status: 'skipped',
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todaysAdventure'] }),
  });
}
