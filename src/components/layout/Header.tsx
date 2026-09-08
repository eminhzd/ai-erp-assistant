import { LogoutBtn } from './header/LogoutBtn';

export function Header() {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b px-6">
      <p className="text-sm font-medium">New conversation</p>
      <LogoutBtn />
    </header>
  );
}
