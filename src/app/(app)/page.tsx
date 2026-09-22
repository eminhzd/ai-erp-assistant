import { Chat } from '@/components/chat/Chat';

export default async function Home() {
  return <Chat chat={{ id: null }} messages={[]} />;
}
