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

const chatRequestSchema = z.object({
  chatId: z.number().int().positive().optional(),
  content: z.string().trim().min(1).max(3000).optional(),
  messages: z.array(z.unknown()).optional(),
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

    const json = await req.json();

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
    const isNewChat = !chatId;

    let currentChatId = chatId;

    /*
     * Create the chat on the first user message.
     *
     * Approval continuation already has an existing chatId,
     * so it never enters this branch.
     */
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
