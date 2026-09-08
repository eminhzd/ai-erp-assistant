import { notFound, redirect } from 'next/navigation';

import { auth } from '@/auth';

import { getChatById } from '@/server/chat/chat.service';
import { getMessagesByChatId } from '@/server/messages/messages.service';

import { Chat } from '@/components/chat/Chat';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  const chatId = Number(id);

  if (!Number.isInteger(chatId) || chatId <= 0) {
    notFound();
  }

  const companyId = session.user.companyId;

  const chat = await getChatById(companyId, chatId);

  if (!chat) {
    notFound();
  }

  const messages = await getMessagesByChatId(companyId, chatId);

  return <Chat messages={messages} chat={chat} />;
}
