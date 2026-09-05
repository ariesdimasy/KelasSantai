import { useEffect, useState } from 'react';

/**
 * true setelah komponen selesai mount di browser.
 *
 * Dipakai untuk data yang hanya ada di client (keranjang dari localStorage):
 * render pertama di server tidak tahu isi localStorage, jadi kalau langsung
 * ditampilkan akan terjadi hydration mismatch. Dengan hook ini, UI menampilkan
 * placeholder dulu lalu data sebenarnya setelah mount.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
