'use server';

import { ConflictError } from '@/lib/errors';
import { registerUser } from '@/server/users/user.service';

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

type RegisterUserActionResult =
  | {
      error: null;
      success: true;
    }
  | {
      error: string;
      success: false;
    };

export async function registerUserAction(
  registerData: z.infer<typeof registerUserSchema>,
): Promise<RegisterUserActionResult> {
  try {
    const { confirmPassword, ...userData } =
      registerUserSchema.parse(registerData);

    await registerUser(userData);

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: 'Invalid registration data',
        success: false,
      };
    }

    if (error instanceof ConflictError) {
      return {
        error: error.message,
        success: false,
      };
    }

    console.error('Error registering user:', error);

    return {
      error: 'Failed to register user',
      success: false,
    };
  }
}
