import { google } from '@ai-sdk/google';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from 'ai';
import * as z from 'zod';

import { auth } from '@/auth';

import { createChatWithMessage, getChatById } from '@/server/chat/chat.service';

import {
  createMessage,
  getMessagesByChatId,
} from '@/server/messages/messages.service';

const chatRequestSchema = z.object({
  chatId: z.number().int().positive().optional(),
  content: z.string().trim().min(1).max(3000),
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

    const { chatId, content } = validation.data;

    let currentChatId = chatId;

    if (!currentChatId) {
      const chat = await createChatWithMessage(companyId, {
        content,
      });

      currentChatId = chat.id;
    } else {
      const chat = await getChatById(companyId, currentChatId);

      if (!chat) {
        return Response.json({ error: 'Chat not found' }, { status: 404 });
      }

      await createMessage(companyId, {
        chatId: currentChatId,
        role: 'user',
        content,
      });
    }

    const messages = await getMessagesByChatId(companyId, currentChatId);

    const modelMessages = messages.map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.content,
    }));

    const streamResult = streamText({
      model: google('gemini-3.7-flash'),
      messages: modelMessages,
    });

    return createUIMessageStreamResponse({
      stream: createUIMessageStream({
        async execute({ writer }) {
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
              chatId: currentChatId,
              role: 'assistant',
              content: text,
            });

            writer.write({
              type: 'data-chat',
              data: {
                chatId: currentChatId,
              },
              transient: true,
            });
          } finally {
            reader.releaseLock();
          }
        },
      }),
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 },
    );
  }
}
