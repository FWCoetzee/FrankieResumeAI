'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { authFetch } from '@/lib/auth-fetch';

interface UserProfile {
  id: number;
  firebase_uid: string;
  email: string;
  display_name: string;
  plan: 'free' | 'pro' | 'lifetime';
  created_at: string;
  updated_at: string;
}

export function useUserProfile() {
  const { user, isUserLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't fetch if the main user object is still loading
    if (isUserLoading) {
      return;
    }

    // If there's no logged-in user, we're done.
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authFetch('/api/users/me');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err);
        console.error("useUserProfile hook error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

  }, [user, isUserLoading]); // Re-run when the user object changes

  return { profile, isLoading, error };
}
