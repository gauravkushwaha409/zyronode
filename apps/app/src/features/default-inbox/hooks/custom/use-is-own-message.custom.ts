import { useMeQuery } from '@/features/auth/hooks';

/** True when `senderId` is the logged-in agent's own user id. */
export function useIsOwnMessage(senderId: string | null): boolean {
  const { data } = useMeQuery();
  const currentUserId = data?.data?.data?.id;
  return !!currentUserId && !!senderId && currentUserId === senderId;
}
