import { useRouter } from 'expo-router';
import React from 'react';

import OnboardingScreen from '@/features/onboarding/OnboardingScreen';

export default function OnboardingRoute() {
  const router = useRouter();

  return (
    <OnboardingScreen
      onComplete={() => {
        router.replace('/');
      }}
    />
  );
}
