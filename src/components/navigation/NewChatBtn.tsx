'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const NewChatBtn = ({ className }: { className?: string }) => {
  const router = useRouter();

  return (
    <Button
      className={cn('cursor-pointer', className)}
      onClick={() => router.push('/')}
    >
      New Chat
    </Button>
  );
};
