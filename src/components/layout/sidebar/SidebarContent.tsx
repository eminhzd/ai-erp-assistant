import { NewChatBtn } from '@/components/navigation/NewChatBtn';

import { SidebarSection } from './SidebarSection';
import { ChatBtn } from './ChatBtn';
import { NavLink } from './NavLink';

type SidebarContentProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

const navigation = [
  { label: 'Customers', href: '/customers' },
  { label: 'Suppliers', href: '/suppliers' },
  { label: 'Products', href: '/products' },
  { label: 'Warehouses', href: '/warehouses' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Sales', href: '/sales' },
  { label: 'Purchases', href: '/purchases' },
];

export function SidebarContent({ chats }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
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
    </div>
  );
}
