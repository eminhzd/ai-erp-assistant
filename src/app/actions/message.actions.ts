'use server';

import { auth } from '@/auth';

import {
  createMessage,
  getMessagesByChatId,
} from '@/server/messages/messages.service';

export type MessageCreateClientInput = {
  chatId: number;
  content: string;
};

type CreateMessageSuccess = {
  data: Awaited<ReturnType<typeof createMessage>>;
  success: true;
};

type CreateMessageError = {
  data: null;
  error: string;
  success: false;
};

export async function createMessageAction(
  messageData: MessageCreateClientInput,
): Promise<CreateMessageSuccess | CreateMessageError> {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  try {
    const response = await createMessage(companyId, {
      ...messageData,
      role: 'user',
    });

    return {
      data: response,
      success: true,
    };
  } catch (error) {
    console.error('Error creating message:', error);

    return {
      data: null,
      error: 'Failed to send message',
      success: false,
    };
  }
}

export async function getMessagesByChatIdAction(chatId: number) {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  return getMessagesByChatId(companyId, chatId);
}
