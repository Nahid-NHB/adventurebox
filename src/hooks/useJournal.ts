import { useQuery } from '@tanstack/react-query';
import { journalRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';
import { useChildren } from './useChildren';

export function useJournal() {
  const { data: children } = useChildren();
  const childIds = (children ?? []).map((c) => c.id);
  return useQuery({
    queryKey: [...qk.journal(LOCAL_FAMILY_ID), childIds],
    queryFn: () => journalRepo.getJournal(childIds),
  });
}
