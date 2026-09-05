/// <reference types="astro/client" />

import type { SessionUser } from '@/lib/types';

declare global {
  namespace App {
    interface Locals {
      /** User yang sedang login (hasil verifikasi JWT di middleware). null = guest. */
      user: SessionUser | null;
    }
  }
}

interface ImportMetaEnv {
  readonly FIBER_API_URL?: string;
  readonly AUTH_SECRET?: string;
  readonly AUTH_TOKEN_TTL?: string;
  readonly PUBLIC_SITE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
