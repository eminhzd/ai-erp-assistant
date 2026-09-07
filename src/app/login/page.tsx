'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex items-center justify-center gap-2">
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>

          <Button type="submit" className="w-full cursor-pointer">
            Login
          </Button>
        </form>
      </div>
    </main>
  );
}
