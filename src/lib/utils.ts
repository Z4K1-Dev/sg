import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { hash } from 'bcryptjs';

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await hash(password, saltRounds);
}

import { randomBytes, createHash } from 'crypto';

/**
 * Merges class names using clsx and tailwind-merge
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random token for password reset
 * @returns A random hexadecimal string
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a hash of the token for storage in the database
 * @param token - The token to hash
 * @returns The SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}