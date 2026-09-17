'use server';

import { ConflictError } from '@/lib/errors';
import { registerUser } from '@/server/users/user.service';
import type { ActionResult } from '@/types/action-result';

import * as z from 'zod';

const registerUserSchema = z
  .object({
    companyName: z.string().trim().min(1).max(100),
    email: z.email().trim().max(100),
    password: z.string().trim().min(8).max(100),
    confirmPassword: z.string().trim().min(8).max(100),
    name: z.string().trim().min(1).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function registerUserAction(
  registerData: z.infer<typeof registerUserSchema>,
): Promise<ActionResult<null>> {
  try {
    const validatedData = registerUserSchema.parse(registerData);

    const userData = {
      companyName: validatedData.companyName,
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
    };

    await registerUser(userData);

    return {
      data: null,
      error: null,
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: 'Invalid registration data',
        success: false,
      };
    }

    if (error instanceof ConflictError) {
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    console.error('Error registering user:', error);

    return {
      data: null,
      error: 'Failed to register user',
      success: false,
    };
  }
}
