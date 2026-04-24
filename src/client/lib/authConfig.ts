export const CLERK_PUBLISHABLE_KEY: string | undefined =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const authEnabled = Boolean(CLERK_PUBLISHABLE_KEY);
