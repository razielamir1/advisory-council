import { authEnabled } from './authConfig';

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function registerTokenGetter(fn: TokenGetter | null): void {
  tokenGetter = fn;
}

export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (!authEnabled || !tokenGetter) {
    return fetch(input, init);
  }

  const token = await tokenGetter();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
