import { getChatsAction } from '@/app/actions/chat.actions';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chats = await getChatsAction(1);

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
