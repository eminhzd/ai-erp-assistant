'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { registerUserAction } from '@/app/actions/user.actions';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setError('');

    try {
      const result = await registerUserAction({
        companyName,
        name,
        email,
        password,
        confirmPassword,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push('/login');
      //   router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Register</h1>
          <p className="text-muted-foreground text-sm">Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>

            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>

            <Input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your Name"
              required
            />
          </div>

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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>

            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </div>
    </main>
  );
}
