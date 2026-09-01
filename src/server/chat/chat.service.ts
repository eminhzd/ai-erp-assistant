import { db } from '@/prisma/db';

export type ChatCreateInput = {
  title?: string;
  companyId: number;
};

export async function createChat(chatData: ChatCreateInput) {
  return db.orm.public.Chat.create(chatData);
}

export async function getChatById(companyId: number, id: number) {
  return db.orm.public.Chat.where({
    companyId,
    id,
  }).first();
}

export async function getChats(companyId: number) {
  return db.orm.public.Chat.where({
    companyId,
  }).all();
}

export async function deleteChat(companyId: number, id: number) {
  return db.orm.public.Chat.where({
    companyId,
    id,
  }).delete();
}
