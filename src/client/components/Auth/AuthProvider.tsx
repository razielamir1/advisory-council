import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useUser, SignIn } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, authEnabled } from '../../lib/authConfig';
import { registerTokenGetter } from '../../lib/authedFetch';
import { identify, resetAnalytics } from '../../lib/analytics';

function TokenBridge() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    registerTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
    return () => registerTokenGetter(null);
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn && user) {
      identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      });
    } else {
      resetAnalytics();
    }
  }, [isSignedIn, user]);

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!authEnabled) {
    return <>{children}</>;
  }
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!}>
      <TokenBridge />
      {children}
    </ClerkProvider>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  if (!authEnabled) {
    return <>{children}</>;
  }
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                כנס את המועצה
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                הכנס/י את המייל שלך כדי להתחיל. נשלח קישור כניסה.
              </p>
            </div>
            <SignIn routing="hash" />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
