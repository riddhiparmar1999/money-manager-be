import { createHash, randomBytes } from 'node:crypto';

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createRefreshTokenValue(): string {
  return randomBytes(32).toString('base64url');
}

export function refreshTokenExpiresAt(days = 7): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}
