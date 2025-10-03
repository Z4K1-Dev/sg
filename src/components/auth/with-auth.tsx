'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasRole } from '@/lib/authorization';

interface WithAuthProps {
  requiredRole?: string;
  children: React.ReactNode;
}

export default function WithAuth({ requiredRole = 'USER', children }: WithAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading, don't redirect yet
    
    if (status === 'unauthenticated' || !session?.user) {
      router.push('/login');
      return;
    }

    if (requiredRole && !hasRole(session, requiredRole)) {
      router.push('/unauthorized'); // Redirect to unauthorized page
      return;
    }
  }, [status, session, requiredRole, router]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (status === 'unauthenticated' || !hasRole(session, requiredRole)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

// Hook version of the authorization check
export function useAuthorization(requiredRole: string = 'USER') {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isAuthorized = isAuthenticated && hasRole(session, requiredRole);
  
  return {
    isLoading,
    isAuthenticated,
    isAuthorized,
    session
  };
}