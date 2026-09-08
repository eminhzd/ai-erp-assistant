'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function LogoutBtn() {
  return (
    <Button
      className={'cursor-pointer'}
      variant="outline"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Logout
    </Button>
  );
}
