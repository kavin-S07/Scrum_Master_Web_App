import crypto from 'crypto';

/** SHA-256 hash of a refresh token. Never store raw tokens in the DB. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
