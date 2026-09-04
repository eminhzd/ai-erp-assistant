'use server';

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
  const data = {
    ...chatData,
    companyId: 1, // Assuming companyId is always 1 for this example
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

export async function getChatByIdAction(companyId: number, chatId: number) {
  return getChatById(companyId, chatId);
}

export async function getChatsAction(companyId: number) {
  return getChats(companyId);
}

export async function deleteChatAction(companyId: number, chatId: number) {
  return deleteChat(companyId, chatId);
}
