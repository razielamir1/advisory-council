import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let sqlClient: NeonQueryFunction<false, false> | null = null;

export function isDbEnabled(): boolean {
  return Boolean(process.env.NEON_DATABASE_URL);
}

export function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) {
      throw new Error('NEON_DATABASE_URL env var is required');
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}
