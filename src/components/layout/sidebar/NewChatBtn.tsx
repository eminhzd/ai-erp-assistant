'use client';

import { Button } from '../../ui/button';
import { useRouter } from 'next/navigation';

export const NewChatBtn = () => {
  const router = useRouter();
  return (
    <Button
      className="mt-2 h-10 w-full cursor-pointer rounded-lg border px-3 text-left"
      onClick={() => router.push('/')}
    >
      New Chat
    </Button>
  );
};
