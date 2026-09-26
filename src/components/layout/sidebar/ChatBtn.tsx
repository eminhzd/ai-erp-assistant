'use client';

import { useRef, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteChatAction,
  updateChatTitleAction,
} from '@/app/actions/chat.actions';
import { ConfirmDialog } from '@/components/confirmation-dialog/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const ChatBtn = ({
  chat,
}: {
  chat: { id: number; title: string | null };
}) => {
  const router = useRouter();
  const params = useParams();

  const selectedChatId = params.id;
  const isSelected = Number(selectedChatId) === chat.id;

  const inputRef = useRef<HTMLInputElement>(null);

  const currentChatTitle = chat.title || `Chat ${chat.id}`;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTitleEditActive, setIsTitleEditActive] = useState(false);
  const [title, setTitle] = useState(currentChatTitle);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setTitle(currentChatTitle);
    setIsTitleEditActive(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const handleCancelEdit = () => {
    if (isSaving) return;

    setTitle(currentChatTitle);
    setIsTitleEditActive(false);
  };

  const handleSaveTitle = async () => {
    const newTitle = title.trim();

    if (!newTitle) {
      setTitle(currentChatTitle);
      setIsTitleEditActive(false);
      return;
    }

    if (newTitle === currentChatTitle) {
      setIsTitleEditActive(false);
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateChatTitleAction(chat.id, newTitle);

      if (!result.success) {
        toast.error(result.error, { position: 'top-right' });
        return;
      }

      setIsTitleEditActive(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update chat title:', error);
      toast.error('Failed to update chat title', { position: 'top-right' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSaveTitle();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleDelete = async () => {
    const result = await deleteChatAction(chat.id);

    if (!result.success) {
      toast.error(result.error, { position: 'top-right' });
      return;
    }
    setIsDeleteDialogOpen(false);

    if (Number(selectedChatId) === chat.id) {
      router.replace('/');
      return;
    }

    router.refresh();
  };

  return (
    <div className="group relative w-full">
      {isTitleEditActive ? (
        <Input
          ref={inputRef}
          autoFocus
          value={title}
          disabled={isSaving}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          onBlur={handleCancelEdit}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'h-8 rounded-lg border-transparent px-3 text-xs shadow-none focus-visible:ring-0',
            isSelected
              ? 'bg-black/10 dark:bg-white/15'
              : 'bg-black/5 dark:bg-white/10',
          )}
        />
      ) : (
        <Button
          variant="ghost"
          className={cn(
            'w-full cursor-pointer justify-start rounded-lg px-3 text-left text-xs',
            isSelected
              ? 'bg-black/10! group-hover:bg-black/10! dark:bg-white/15! dark:group-hover:bg-white/15!'
              : 'bg-black/5! group-hover:bg-black/10! dark:bg-white/10! dark:group-hover:bg-white/15!',
          )}
          onClick={() => router.push(`/chat/${chat.id}`)}
        >
          <span className="block min-w-0 overflow-hidden whitespace-nowrap">
            {currentChatTitle}
          </span>
        </Button>
      )}

      {!isTitleEditActive && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center rounded-lg pr-1 pl-8 opacity-0 transition-opacity group-hover:opacity-100',
            isSelected
              ? 'bg-linear-to-l from-neutral-200 from-[3.5rem] to-transparent dark:from-neutral-700 dark:from-[3.5rem]'
              : 'bg-linear-to-l from-neutral-100 from-[3.5rem] to-transparent group-hover:from-neutral-200 dark:from-neutral-800 dark:from-[3.5rem] dark:group-hover:from-neutral-700',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
            onClick={handleEdit}
            aria-label="Edit chat title"
          >
            <Pencil className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            aria-label="Delete chat"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete chat?"
        description="This action cannot be undone."
        confirmText="Delete"
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
