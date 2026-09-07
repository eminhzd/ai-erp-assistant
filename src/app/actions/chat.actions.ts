'use server';

import { auth } from '@/auth';
import {
  createChatWithMessage,
  getChatById,
  getChats,
  deleteChat,
} from '@/server/chat/chat.service';

export type CreateChatWithMessageClientInput = {
  title?: string;
  content: string;
};

type CreateChatWithMessageSuccess = {
  data: Awaited<ReturnType<typeof createChatWithMessage>>;
  success: true;
};

type CreateChatWithMessageError = {
  data: null;
  error: string;
  success: false;
};

export async function createChatWithMessageAction(
  chatData: CreateChatWithMessageClientInput,
): Promise<CreateChatWithMessageSuccess | CreateChatWithMessageError> {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  const data = {
    ...chatData,
    companyId,
  };

  try {
    const response = await createChatWithMessage(data);
    const finalizedResponse: CreateChatWithMessageSuccess = {
      data: response,
      success: true,
    };

    return finalizedResponse;
  } catch (error) {
    console.error('Error creating chat:', error);

    return {
      data: null,
      error: 'Failed to create chat',
      success: false,
    };
  }
}

export async function getChatByIdAction(chatId: number) {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  return getChatById(companyId, chatId);
}

export async function getChatsAction() {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false as const,
    };
  }

  const companyId = session.user.companyId;

  const chats = await getChats(companyId);

  return {
    data: chats,
    error: null,
    success: true as const,
  };
}

export async function deleteChatAction(chatId: number) {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  return deleteChat(companyId, chatId);
}
