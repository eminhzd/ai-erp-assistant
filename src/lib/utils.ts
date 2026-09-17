import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as z from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function runTool<T>(
  toolName: string,
  failureMessage: string,
  operation: () => Promise<T>,
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    return {
      success: true,
      data: await operation(),
    };
  } catch (error) {
    console.error(`${toolName} tool failed:`, error);

    return {
      success: false,
      error: failureMessage,
    };
  }
}

export const decimalStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/);
