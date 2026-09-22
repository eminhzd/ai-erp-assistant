import { LogoutBtn } from './header/LogoutBtn';
import { MenuBtn } from '../navigation/MenuBtn';
import { NewChatBtn } from '../navigation/NewChatBtn';

type HeaderProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

export function Header({ chats }: HeaderProps) {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b px-3 sm:px-6">
      <div className="flex items-center min-[510px]:hidden">
        <MenuBtn chats={chats} />
        <NewChatBtn className="ml-3" />
      </div>

      <div className="ml-auto">
        <LogoutBtn />
      </div>
    </header>
  );
}
