'use client';

import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export const ChatBtn = ({
  chat,
}: {
  chat: { id: number; title: string | null };
}) => {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      className="w-full cursor-pointer rounded-lg px-3 text-left text-xs"
      key={chat.id}
      onClick={() => router.push(`/chat/${chat.id}`)}
    >
      {chat.title || `Chat ${chat.id}`}
    </Button>
  );
};
