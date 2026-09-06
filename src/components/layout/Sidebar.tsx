import { NewChatBtn } from '../sidebar/NewChatBtn';

import { ChatBtn } from '../sidebar/ChatBtn';

type SidebarProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

export function Sidebar({ chats }: SidebarProps) {
  return (
    <aside className="bg-background flex h-full w-64 shrink-0 flex-col border-r p-3">
      <div>
        <span>AI ERP Assistant</span>
      </div>

      <NewChatBtn />

      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <h3 className="text-muted-foreground shrink-0 text-sm font-semibold">
          Chats
        </h3>

        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {chats.map((chat) => (
              <ChatBtn key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex shrink-0 flex-col items-center">
        <span>Emin Huseynzade</span>
        <span>Frontend Developer</span>
      </div>
    </aside>
  );
}
