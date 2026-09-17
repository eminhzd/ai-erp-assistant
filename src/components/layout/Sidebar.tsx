import { NewChatBtn } from '../navigation/NewChatBtn';
import { ChatBtn } from './sidebar/ChatBtn';

// import { auth } from '@/auth';

type SidebarProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

export async function Sidebar({ chats }: SidebarProps) {
  // const session = await auth();

  return (
    <aside className="bg-background flex h-full w-64 shrink-0 flex-col border-r p-3 max-[700px]:w-54 max-[510px]:hidden">
      <div>
        <span>AI ERP Assistant</span>
      </div>

      <NewChatBtn className="mt-2 h-10 w-full rounded-lg border px-3 text-left" />

      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <h3 className="text-muted-foreground shrink-0 text-sm font-semibold">
          Chats
        </h3>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {chats.reverse().map((chat) => (
              <ChatBtn key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      </div>

      {/* <div className="items-left mt-auto flex shrink-0 flex-col">
        <span>{session?.user.name}</span>
        <span>{session?.user.email}</span>
      </div> */}
    </aside>
  );
}
