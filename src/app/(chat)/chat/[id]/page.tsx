import { notFound } from 'next/navigation';

import { getChatById } from '@/server/chat/chat.service';
import { getMessagesByChatId } from '@/server/messages/messages.service';
import { Chat } from '@/components/chat/Chat';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chatId = Number(id);

  if (!Number.isInteger(chatId) || chatId <= 0) notFound();

  const chat = await getChatById(1, chatId);

  if (!chat) notFound();

  const messages = await getMessagesByChatId(1, chatId);

  return <Chat messages={messages} chat={chat} />;
}
