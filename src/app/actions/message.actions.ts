'use server';

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
  const data = {
    ...messageData,
    companyId: 1, // Assuming companyId is always 1 for this example
    role: 'user',
  };

  try {
    const response = await createMessage(data);
    const finalizedResponse: CreateMessageSuccess = {
      data: response,
      success: true,
    };

    return finalizedResponse;
  } catch (error) {
    console.error('Error creating message:', error);

    return {
      data: null,
      error: 'Failed to send message',
      success: false,
    };
  }
}

export async function getMessagesByChatIdAction(
  companyId: number,
  chatId: number,
) {
  return getMessagesByChatId(companyId, chatId);
}
