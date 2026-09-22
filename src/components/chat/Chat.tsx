'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/confirmation-dialog/ConfirmationDialog';

import { isErpToolPart, type ChatUIMessage } from '@/types/chat';
import { getToolStatusText } from './ToolStatus';

import type { InitialMessage } from '@/types/chat';

const messageSchema = z.object({
  content: z.string().trim().min(1).max(3000),
});

const approvalConfig = {
  deleteCustomer: {
    title: 'Delete customer?',
    confirmText: 'Delete',
    description: 'This customer will be deactivated.',
  },
  deleteProduct: {
    title: 'Delete product?',
    confirmText: 'Delete',
    description: 'This product will be deactivated.',
  },
  deleteSupplier: {
    title: 'Delete supplier?',
    confirmText: 'Delete',
    description: 'This supplier will be deactivated.',
  },
  deleteWarehouse: {
    title: 'Delete warehouse?',
    confirmText: 'Delete',
    description: 'This warehouse will be deactivated.',
  },
} as const;

type ApprovalToolName = keyof typeof approvalConfig;

type Chat = {
  id: number | null;
};

export function Chat({
  messages: initialMessages,
  chat,
}: {
  messages: InitialMessage[];
  chat: Chat;
}) {
  const router = useRouter();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resolvedChatIdRef = useRef<number | undefined>(
    chat.id ? Number(chat.id) : undefined,
  );

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  const [resolvedChatId, setResolvedChatId] = useState<number | undefined>(
    chat.id ? Number(chat.id) : undefined,
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',

        prepareSendMessagesRequest: ({ id, messages }) => {
          const lastMessage = messages.at(-1);

          const content =
            lastMessage?.role === 'user'
              ? lastMessage.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('')
              : undefined;

          return {
            body: {
              chatId: resolvedChatId,
              content,
              messages,
              messageId: id,
            },
          };
        },
      }),
    [resolvedChatId],
  );

  const { messages, sendMessage, addToolApprovalResponse, status, error } =
    useChat<ChatUIMessage>({
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

      transport,

      sendAutomaticallyWhen: ({ messages }) => {
        const lastMessage = messages.at(-1);

        return (
          lastMessage?.parts?.some(
            (part) =>
              'state' in part &&
              part.state === 'approval-responded' &&
              'approval' in part &&
              part.approval?.approved === true,
          ) ?? false
        );
      },

      onData(dataPart) {
        if (dataPart.type === 'data-chat') {
          const chatId = dataPart.data.chatId;

          resolvedChatIdRef.current = chatId;
          setResolvedChatId(chatId);
        }
      },

      onFinish: ({ messages, isError, isAbort, isDisconnect }) => {
        if (isError || isAbort || isDisconnect) {
          return;
        }

        const hasPendingApproval = messages.some((message) =>
          message.parts.some(
            (part) =>
              isErpToolPart(part) && part.state === 'approval-requested',
          ),
        );

        if (hasPendingApproval) {
          return;
        }

        const resolvedChatId = resolvedChatIdRef.current;

        if (!chat.id && resolvedChatId) {
          router.replace(`/chat/${resolvedChatId}`);
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
      await sendMessage({
        text: result.data.content,
      });
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

  const pendingApprovalPart = [...messages]
    .reverse()
    .flatMap((message) => [...message.parts].reverse())
    .find((part) => isErpToolPart(part) && part.state === 'approval-requested');

  const pendingApprovalToolName = pendingApprovalPart
    ? pendingApprovalPart.type.slice('tool-'.length)
    : null;

  const pendingApprovalConfig =
    pendingApprovalToolName && pendingApprovalToolName in approvalConfig
      ? approvalConfig[pendingApprovalToolName as ApprovalToolName]
      : null;

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
      {pendingApprovalPart && pendingApprovalConfig && (
        <ConfirmDialog
          open
          title={pendingApprovalConfig.title}
          description={pendingApprovalConfig.description}
          confirmText={pendingApprovalConfig.confirmText}
          onCancel={() => {
            addToolApprovalResponse({
              id: pendingApprovalPart.approval.id,
              approved: false,
            });
          }}
          onConfirm={() => {
            addToolApprovalResponse({
              id: pendingApprovalPart.approval.id,
              approved: true,
            });
          }}
        />
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <p className="text-2xl font-semibold">How can I help?</p>

            <p className="text-muted-foreground mt-1 text-sm">
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
                      className={`w-fit max-w-[85%] rounded-lg px-3 py-2 text-sm ${
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
              <div className="bg-muted text-muted-foreground w-fit self-start rounded-lg px-3 py-2 text-sm">
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

      <div className="flex w-full items-end gap-2 border-t p-4">
        <Textarea
          ref={textareaRef}
          className="min-h-10 flex-1 resize-none"
          placeholder="Ask your ERP assistant..."
          value={newMessage}
          disabled={isLoading}
          onChange={(event) => {
            setNewMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <Button
          className="h-10 w-18 shrink-0"
          disabled={isLoading}
          onClick={handleSendMessage}
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
