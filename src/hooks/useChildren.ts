import { useQuery } from '@tanstack/react-query';
import { familyRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';
import { useSessionStore } from '@/store/session';
import { useEffect } from 'react';

export function useChildren() {
  return useQuery({
    queryKey: qk.children(LOCAL_FAMILY_ID),
    queryFn: () => familyRepo.getChildren(LOCAL_FAMILY_ID),
  });
}

/** The currently selected child, defaulting to the first one. */
export function useActiveChild() {
  const { data: children } = useChildren();
  const { activeChildId, setActiveChild } = useSessionStore();

  useEffect(() => {
    if (!activeChildId && children && children.length > 0) {
      setActiveChild(children[0].id);
    }
  }, [activeChildId, children, setActiveChild]);

  const active =
    children?.find((c) => c.id === activeChildId) ?? children?.[0] ?? null;
  return active;
}
