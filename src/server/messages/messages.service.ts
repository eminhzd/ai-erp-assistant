import { db } from '@/prisma/db';

export type MessageCreateInput = {
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
};

export async function createMessage(
  companyId: number,
  messageData: MessageCreateInput,
) {
  return db.orm.public.Message.create({
    ...messageData,
    companyId,
    role: messageData.role === 'user' ? 'USER' : 'ASSISTANT',
  });
}

export async function getMessagesByChatId(companyId: number, chatId: number) {
  return db.orm.public.Message.where({
    companyId,
    chatId,
  }).all();
}
