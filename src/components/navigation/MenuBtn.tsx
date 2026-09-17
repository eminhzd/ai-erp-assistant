'use client';

import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const MenuBtn = () => {
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

      <SheetContent side="left">
        <div className="flex h-full w-full items-center justify-center">
          <h1>Coming soon...</h1>
        </div>
      </SheetContent>
    </Sheet>
  );
};
