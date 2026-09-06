/// <reference types="vite/client" />

// Preline menaruh helper-nya di window saat modulnya di-import, tapi tipe
// global-nya tidak ikut ter-ekspor lewat "exports" di package.json-nya.
// Jadi cukup dideklarasikan yang dipakai: autoInit() untuk menginisialisasi
// ulang komponen Preline setiap kali React Router mengganti halaman.
//
// File ini tidak punya import/export di level atas, jadi isinya otomatis
// dianggap deklarasi global — tidak perlu `declare global`.
interface Window {
  HSStaticMethods?: {
    autoInit: (collection?: string | string[]) => void
    cleanCollection: (name?: string | string[]) => void
  }
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
