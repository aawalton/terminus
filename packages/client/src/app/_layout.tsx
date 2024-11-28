import { Slot, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';

export default function RootLayout() {
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    // Check if the path is protected
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to the sign-in page
      router.replace('/sign-in');
    } else if (session && inAuthGroup) {
      // Redirect to the home page
      router.replace('/');
    }
  }, [session, initialized, segments]);

  return (
    <>
      <Slot />
    </>
  );
} 