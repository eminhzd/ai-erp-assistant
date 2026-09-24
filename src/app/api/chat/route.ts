import { google } from '@ai-sdk/google';

import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
} from 'ai';

import * as z from 'zod';

import { auth } from '@/auth';
import {
  createChatWithMessage,
  getChatById,
  updateChatTitle,
} from '@/server/chat/chat.service';
import { createErpTools } from '@/server/ai/erp-tools';
import { generateChatTitle } from '@/server/ai/chat-title';
import { createMessage } from '@/server/messages/messages.service';

import { ERP_SYSTEM_PROMPT } from '@/server/ai/system-prompt';
import type { ChatUIMessage } from '@/types/chat';

const MAX_TEXT_LENGTH = 3000;
const MAX_PARTS_PER_MESSAGE = 20;
const MAX_MESSAGES = 50;

const textPartSchema = z.object({
  type: z.literal('text'),
  text: z.string().max(MAX_TEXT_LENGTH),
});

const toolPartSchema = z
  .object({
    type: z.string().regex(/^tool-/),
  })
  .passthrough();

const messagePartSchema = z.union([textPartSchema, toolPartSchema]);
const chatUIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant']),
  parts: z.array(messagePartSchema).min(1).max(MAX_PARTS_PER_MESSAGE),
});

const chatRequestSchema = z.object({
  chatId: z.number().int().positive().optional(),
  content: z.string().trim().min(1).max(3000).optional(),
  messages: z.array(chatUIMessageSchema).max(MAX_MESSAGES).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const companyId = session.user.companyId;

    let json: unknown;

    try {
      json = await req.json();
    } catch {
      return Response.json(
        {
          error: 'Invalid JSON body',
        },
        { status: 400 },
      );
    }

    const validation = chatRequestSchema.safeParse(json);

    if (!validation.success) {
      return Response.json(
        {
          error: 'Invalid request body',
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { chatId, content, messages: uiMessages } = validation.data;
    const isNewChat = chatId === undefined;

    let currentChatId = chatId;

    if (!currentChatId) {
      if (!content) {
        return Response.json(
          {
            error: 'Content is required when creating a new chat',
          },
          { status: 400 },
        );
      }

      const chat = await createChatWithMessage(companyId, {
        content,
      });

      currentChatId = chat.id;
    } else {
      const chat = await getChatById(companyId, currentChatId);

      if (!chat) {
        return Response.json(
          {
            error: 'Chat not found',
          },
          { status: 404 },
        );
      }

      if (content) {
        await createMessage(companyId, {
          chatId: currentChatId,
          role: 'user',
          content,
        });
      }
    }

    if (!uiMessages) {
      return Response.json(
        {
          error: 'Messages are required',
        },
        { status: 400 },
      );
    }

    const tools = createErpTools(companyId);

    const modelMessages = await convertToModelMessages(
      uiMessages as Omit<ChatUIMessage, 'id'>[],
    );

    const streamResult = streamText({
      model: google('gemini-3.5-flash-lite'),
      system: ERP_SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(8),
      maxRetries: 0,
    });

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
          if (isNewChat) {
            writer.write({
              type: 'data-chat',
              data: {
                chatId: currentChatId!,
              },
              transient: true,
            });
          }

          const uiStream = toUIMessageStream({
            stream: streamResult.stream,
          });

          const reader = uiStream.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              writer.write(value);
            }

            const text = await streamResult.text;

            await createMessage(companyId, {
              chatId: currentChatId!,
              role: 'assistant',
              content: text,
            });

            if (isNewChat && content) {
              try {
                const title = await generateChatTitle(content);

                await updateChatTitle(companyId, currentChatId!, title);
              } catch (error) {
                console.error('Failed to generate chat title:', error);
              }
            }
          } finally {
            reader.releaseLock();
          }
        },
      }),
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return Response.json(
      {
        error: 'Failed to process chat request',
      },
      { status: 500 },
    );
  }
}
