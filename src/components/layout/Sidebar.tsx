import { Button } from '@/components/ui/button';

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
      <div>
        <Button className="mt-2 h-10 w-full rounded-lg border px-3 text-left">
          New Chat
        </Button>
      </div>
      <div className="mt-2 flex flex-1 flex-col">
        <h3 className="text-muted-foreground text-sm font-semibold">Chats</h3>
        <div className="mt-2 flex flex-col gap-2">
          {chats.map((chat) => (
            <Button
              variant="secondary"
              className="w-full rounded-lg px-3 text-left text-xs"
              key={chat.id}
            >
              {chat.title || `Chat ${chat.id}`}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-auto flex flex-col items-center">
        <span>Emin Huseynzade</span>
        <span>Frontend Developer</span>
      </div>
    </aside>
  );
}
