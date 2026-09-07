import { hash } from 'bcryptjs';

import { db } from '@/prisma/db';
import { ConflictError } from '@/lib/errors';

export type RegisterUserInput = {
  companyName: string;
  email: string;
  password: string;
  name: string;
};

export async function registerUser({
  companyName,
  email,
  password,
  name,
}: RegisterUserInput) {
  const passwordHash = await hash(password, 12);

  return db.transaction(async (tx) => {
    const existingUser = await tx.orm.public.User.where({
      email,
    }).first();

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const company = await tx.orm.public.Company.create({
      name: companyName,
    });

    const user = await tx.orm.public.User.create({
      email,
      passwordHash,
      name,
      companyId: company.id,
    });

    return {
      user,
      company,
    };
  });
}
