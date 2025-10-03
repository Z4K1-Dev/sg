'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard' 
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <Button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            variant="outline"
            className="w-full"
          >
            <FaGithub className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}