'use client';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { SidebarContent } from '../layout/sidebar/SidebarContent';

type MenuBtnProps = {
  chats: {
    id: number;
    title: string | null;
  }[];
};

export const MenuBtn = ({ chats }: MenuBtnProps) => {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        }
      />

      <SheetContent side="left" className="w-64 p-3">
        <SidebarContent chats={chats} />
      </SheetContent>
    </Sheet>
  );
};
