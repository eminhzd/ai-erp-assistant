'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';

import * as z from 'zod';
import type { ChatUIMessage } from '@/types/chat';

const MessageSchema = z.object({
  content: z.string().trim().min(1).max(3000),
});

export function Chat({
  messages: initialMessages,
  chat,
}: {
  // eslint-disable-next-line
  messages: any[];
  // eslint-disable-next-line
  chat: any;
}) {
  const router = useRouter();

  const [newMessage, setNewMessage] = useState('');

  const { messages, sendMessage, status, error } = useChat<ChatUIMessage>({
    id: chat.id ? String(chat.id) : undefined,

    messages: initialMessages.map((message) => ({
      id: String(message.id),
      role: message.role,
      parts: [
        {
          type: 'text',
          text: message.content,
        },
      ],
    })),

    onData(dataPart) {
      if (dataPart.type === 'data-chat') {
        router.push(`/chat/${dataPart.data.chatId}`);
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSendMessage = async () => {
    if (isLoading) return;

    const result = MessageSchema.safeParse({
      content: newMessage,
    });

    if (!result.success) {
      console.error(result.error);
      return;
    }

    try {
      await sendMessage(
        {
          text: result.data.content,
        },
        {
          body: {
            chatId: chat.id,
            content: result.data.content,
          },
        },
      );

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-2xl font-semibold">How can I help?</p>
            <p className="text-muted-foreground text-sm">
              Ask me to work with your ERP data.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`w-fit max-w-[85%] rounded-lg p-2 ${
                  message.role === 'assistant'
                    ? 'bg-muted text-muted-foreground self-start'
                    : 'bg-primary text-primary-foreground self-end'
                }`}
              >
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <span
                        key={index}
                        className="wrap-break-words whitespace-pre-wrap"
                      >
                        {part.text}
                      </span>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-2 border-t p-4">
        <Textarea
          className="flex-1 resize-none"
          placeholder="Ask your ERP assistant..."
          value={newMessage}
          disabled={isLoading}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <Button disabled={isLoading} onClick={handleSendMessage}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>

      {error && (
        <div className="text-destructive px-4 pb-2 text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
}
