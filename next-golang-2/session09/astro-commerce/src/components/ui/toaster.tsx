import { Toaster as SonnerToaster } from 'sonner';

/**
 * Notifikasi global. Dipasang sekali di layout (client:load), lalu komponen
 * mana pun bisa memanggil `toast.success(...)` dari 'sonner'.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-md border shadow-lg',
        },
      }}
    />
  );
}
