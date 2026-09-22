'use client';

import { useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
};

export function SidebarSection({
  title,
  children,
  defaultOpen = true,
  className = '',
  contentClassName = '',
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={`flex min-h-0 flex-col ${className}`}
    >
      <CollapsibleTrigger
        render={
          <Button
            variant="ghost"
            className="text-muted-foreground h-auto w-full shrink-0 cursor-pointer justify-between px-2 py-1.5 text-sm font-semibold hover:bg-transparent"
          />
        }
      >
        {title}

        <ChevronDown
          className={`size-4 transition-transform ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className={`min-h-0 ${contentClassName}`}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
