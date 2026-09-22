import { NewChatBtn } from '../navigation/NewChatBtn';
import { SidebarSection } from './sidebar/SidebarSection';
import { ChatBtn } from './sidebar/ChatBtn';
import { NavLink } from './sidebar/NavLink';

type SidebarProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

const navigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Customers', href: '/customers' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Products', href: '/products' },
  { label: 'Warehouses', href: '/warehouses' },
  { label: 'Sales', href: '/sales' },
  { label: 'Purchases', href: '/purchases' },
];

export async function Sidebar({ chats }: SidebarProps) {
  return (
    <aside className="bg-background flex h-dvh w-64 shrink-0 flex-col overflow-hidden border-r p-3 max-[700px]:w-54 max-[510px]:hidden">
      <div className="shrink-0">
        <span className="font-semibold">AI ERP Assistant</span>
      </div>

      <NewChatBtn className="mt-3 h-10 w-full shrink-0 rounded-lg border px-3 text-left" />

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2">
        <SidebarSection title="ERP">
          <nav>
            <div className="mt-1.5 flex flex-col gap-1">
              {navigation.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </SidebarSection>

        <SidebarSection
          title="Chats"
          className="min-h-0 flex-1"
          contentClassName="min-h-0 flex-1 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            <div className="mt-1.5 flex flex-col gap-1">
              {[...chats].reverse().map((chat) => (
                <ChatBtn key={chat.id} chat={chat} />
              ))}
            </div>
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
