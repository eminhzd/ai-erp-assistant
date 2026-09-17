'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

import * as z from 'zod';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { isErpToolPart, type ChatUIMessage } from '@/types/chat';
import { getToolStatusText } from './ToolStatus';

const messageSchema = z.object({
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const router = useRouter();

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
        router.refresh();
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSendMessage = async () => {
    if (isLoading) return;

    const result = messageSchema.safeParse({
      content: newMessage,
    });

    if (!result.success) {
      console.error(result.error);
      return;
    }

    setNewMessage('');

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
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const threshold = 80;

    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold;

    setIsAtBottom(atBottom);
  };

  useEffect(() => {
    if (status === 'ready') {
      textareaRef.current?.focus();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'submitted') {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      });

      return;
    }

    if (!isAtBottom) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'end',
    });
  }, [messages, status, isAtBottom]);

  const activeToolPart = [...messages]
    .reverse()
    .flatMap((message) => [...message.parts].reverse())
    .find(
      (part) =>
        isErpToolPart(part) &&
        part.state !== 'output-available' &&
        part.state !== 'output-error',
    );

  const activeToolName = activeToolPart
    ? activeToolPart.type.slice('tool-'.length)
    : null;

  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant');

  const hasAssistantText =
    lastAssistantMessage?.parts.some(
      (part) => part.type === 'text' && part.text.trim().length > 0,
    ) ?? false;

  const showStatusBubble = isLoading && !hasAssistantText && !error;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-2xl font-semibold">How can I help?</p>

            <p className="text-muted-foreground text-sm">
              Ask me to work with your ERP data.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 p-4">
            {messages.flatMap((message) =>
              message.parts.map((part, partIndex) => {
                const key = `${message.id}-${partIndex}`;

                if (part.type === 'text' && part.text.trim().length > 0) {
                  return (
                    <div
                      key={key}
                      className={`w-fit max-w-[85%] rounded-lg p-2 ${
                        message.role === 'assistant'
                          ? 'bg-muted text-muted-foreground self-start'
                          : 'bg-primary text-primary-foreground self-end'
                      }`}
                    >
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  );
                }

                return null;
              }),
            )}

            {showStatusBubble && (
              <div className="bg-muted text-muted-foreground w-fit self-start rounded-lg p-2 text-sm">
                <span className="animate-pulse">
                  {activeToolName
                    ? getToolStatusText(activeToolName)
                    : 'Thinking...'}
                </span>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-full items-center gap-2 border-t p-4">
        <Textarea
          ref={textareaRef}
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

        <Button
          disabled={isLoading}
          onClick={handleSendMessage}
          className="h-10 w-18"
        >
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
