import { SidebarContent } from './sidebar/SidebarContent';

type SidebarProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

export async function Sidebar({ chats }: SidebarProps) {
  return (
    <aside className="bg-background flex h-dvh w-64 shrink-0 flex-col overflow-hidden border-r p-3 max-[700px]:w-54 max-[510px]:hidden">
      <SidebarContent chats={chats} />
    </aside>
  );
}
