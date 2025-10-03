'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Register the user via API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Registration successful, now sign in
        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.ok) {
          router.push('/dashboard');
          router.refresh();
        } else {
          alert('Registration successful, but login failed. Please try logging in.');
        }
      } else {
        const data = await res.json();
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full"
              type="button"
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
            <Button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              variant="outline"
              className="w-full"
              type="button"
            >
              <FaGithub className="mr-2 h-4 w-4" />
              Sign up with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}