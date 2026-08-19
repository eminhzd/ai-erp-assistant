import { Chat } from '@/components/chat/Сhat';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function Home() {
  return (
    <main className="flex h-screen w-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <Chat />
      </div>
    </main>
  );
}
