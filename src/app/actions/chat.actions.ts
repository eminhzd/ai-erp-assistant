'use server';

import { auth } from '@/auth';
import {
  getChats,
  deleteChat,
  updateChatTitle,
} from '@/server/chat/chat.service';
import type { ActionResult } from '@/types/action-result';

import * as z from 'zod';

export type CreateChatWithMessageClientInput = {
  title?: string;
  content: string;
};

const updateChatTitleSchema = z.object({
  chatId: z.number().int().positive(),
  title: z.string().trim().min(1).max(100),
});

export async function getChatsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getChats>>>
> {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  try {
    const response = await getChats(companyId);

    return {
      data: response,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error getting chats:', error);

    return {
      data: null,
      error: 'Failed to get chats',
      success: false,
    };
  }
}

export async function deleteChatAction(
  chatId: number,
): Promise<ActionResult<Awaited<ReturnType<typeof deleteChat>>>> {
  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  try {
    const response = await deleteChat(companyId, chatId);

    return {
      data: response,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error deleting chat:', error);

    return {
      data: null,
      error: 'Failed to delete chat',
      success: false,
    };
  }
}

export async function updateChatTitleAction(
  chatId: number,
  title: string,
): Promise<ActionResult<Awaited<ReturnType<typeof updateChatTitle>>>> {
  const validation = updateChatTitleSchema.safeParse({
    chatId,
    title,
  });

  if (!validation.success) {
    return {
      data: null,
      error: 'Invalid chat title',
      success: false,
    };
  }

  const session = await auth();

  if (!session?.user) {
    return {
      data: null,
      error: 'Unauthorized',
      success: false,
    };
  }

  const companyId = session.user.companyId;

  try {
    const response = await updateChatTitle(
      companyId,
      validation.data.chatId,
      validation.data.title,
    );

    return {
      data: response,
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error updating chat:', error);

    return {
      data: null,
      error: 'Failed to update chat',
      success: false,
    };
  }
}
