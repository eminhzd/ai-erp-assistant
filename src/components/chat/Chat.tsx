'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { createChatWithMessageAction } from '@/app/actions/chat.actions';
import { createMessageAction } from '@/app/actions/message.actions';

import { toast } from 'sonner';

import * as z from 'zod';

const MessageSchema = z.object({ content: z.string().max(3000) });

// eslint-disable-next-line
export function Chat({ messages, chat }: { messages: any[]; chat: any }) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const result = MessageSchema.safeParse({
      content: newMessage,
    });
    if (!result.success) {
      console.error(result.error);
    } else {
      startTransition(async () => {
        if (chat.id) {
          const response = await createMessageAction({
            ...result.data,
            chatId: chat.id,
          });

          if (response.success) {
            setNewMessage('');
            router.refresh();
          } else {
            toast.error(response.error);
          }
        } else {
          const response = await createChatWithMessageAction({
            content: result.data.content,
          });
          if (response.success) {
            setNewMessage('');
            router.push(`/chat/${response.data.id}`);
          } else {
            toast.error(response.error);
          }
        }
      });
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        {messages.length === 0 ? (
          <div className="text-center">
            <p className="text-2xl font-semibold">How can I help?</p>
            <p className="text-muted-foreground text-sm">
              Ask me to work with your ERP data.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-2 ${
                  message.role === 'assistant'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-full items-center gap-2 border-t p-4">
        <Textarea
          placeholder="Ask your ERP assistant..."
          value={newMessage}
          disabled={isPending}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button disabled={isPending} onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}
