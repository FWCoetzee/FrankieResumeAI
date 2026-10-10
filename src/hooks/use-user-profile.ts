'use client';

import { useMemo } from 'react';

export type UserProfile = {
  plan: 'free' | 'pro' | 'team';
  name?: string;
};

export function useUserProfile() {
  return useMemo(
    () => ({
      profile: {
        plan: 'free' as const,
        name: 'Guest User',
      },
    }),
    []
  );
}
