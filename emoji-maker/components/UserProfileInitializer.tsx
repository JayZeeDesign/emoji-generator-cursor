"use client"

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function UserProfileInitializer() {
  const { isSignedIn, userId } = useAuth();

  useEffect(() => {
    if (isSignedIn && userId) {
      fetch('/api/user', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            console.error('Error initializing user profile:', data.error);
          }
        })
        .catch((error) => {
          console.error('Error initializing user profile:', error);
        });
    }
  }, [isSignedIn, userId]);

  return null;
}