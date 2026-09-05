/**
 * State user yang sedang login untuk komponen React.
 *
 * Sumber kebenarannya tetap cookie JWT di server: halaman .astro membaca
 * `Astro.locals.user` lalu mengirimnya sebagai prop ke island, dan island
 * memanggil `syncSession()` sekali saat mount. Store ini hanya "cache" supaya
 * beberapa island (header, tombol, form) melihat user yang sama tanpa
 * masing-masing memanggil /api/auth/me.
 *
 * Tidak dipersist — kalau di-persist, data user bisa tertinggal di localStorage
 * setelah logout.
 */
import { create } from 'zustand';
import type { SessionUser } from '@/lib/types';

interface SessionState {
  user: SessionUser | null;
  /** true selama proses login/logout berjalan */
  pending: boolean;
  syncSession: (user: SessionUser | null) => void;
  setPending: (pending: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  pending: false,
  syncSession: (user) => set({ user }),
  setPending: (pending) => set({ pending }),
}));

export const isAdmin = (user: SessionUser | null): boolean => user?.role === 'admin';
