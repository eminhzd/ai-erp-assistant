import { redirect } from 'next/navigation';

import { getChatsAction } from '@/app/actions/chat.actions';
import { auth } from '@/auth';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const chatsResult = await getChatsAction();

  if (!session?.user || !chatsResult.success) {
    redirect('/login');
  }

  const chats = chatsResult.data;

  return (
    <main className="flex h-screen w-screen">
      <Sidebar chats={chats} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        {children}
      </div>
    </main>
  );
}
