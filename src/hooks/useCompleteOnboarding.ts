/**
 * Commits the onboarding draft to SQLite in one shot: creates the child and the
 * family settings, marks the install onboarded, and selects the new child.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { familyRepo } from '@/database';
import { uuid } from '@/lib/id';
import { kv } from '@/services/kv';
import { LOCAL_FAMILY_ID } from '@/services/config';
import { useOnboardingStore } from '@/store/onboarding';
import { useSessionStore } from '@/store/session';
import { getNotificationService } from '@/services/notifications';
import { qk } from '@/api/queryKeys';

export function useCompleteOnboarding() {
  const qc = useQueryClient();
  const draft = useOnboardingStore();
  const setActiveChild = useSessionStore((s) => s.setActiveChild);

  return useMutation({
    mutationFn: async () => {
      const childId = uuid();
      await familyRepo.upsertChild({
        id: childId,
        familyId: LOCAL_FAMILY_ID,
        name: draft.childName.trim() || 'Explorer',
        age: draft.age,
        interests: draft.interests,
        favoriteColors: draft.favoriteColors,
        learningGoals: draft.learningGoals,
        energyDefault: draft.energyDefault,
      });
      await familyRepo.upsertSettings({
        familyId: LOCAL_FAMILY_ID,
        materials: draft.materials,
        environment: draft.environment,
        defaultTimeMinutes: draft.defaultTimeMinutes,
        indoorOutdoorPref: draft.indoorOutdoorPref,
        notifyHour: 9,
      });
      await kv.setBool('onboarded', true);
      setActiveChild(childId);
      // Schedule a gentle daily reminder (opt-in permission prompt inside).
      void getNotificationService().scheduleDaily({ hour: 9, enabled: true });
      return childId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.children(LOCAL_FAMILY_ID) });
      qc.invalidateQueries({ queryKey: qk.settings(LOCAL_FAMILY_ID) });
    },
  });
}
