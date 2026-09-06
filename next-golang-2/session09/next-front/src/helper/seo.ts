import { useEffect } from 'react'

const SITE_NAME = 'Santai Store'

type Seo = {
  title: string
  description: string
  keywords?: string
}

/**
 * useSEO — menyetel <title> + meta description/keywords per halaman.
 *
 * Catatan penting: aplikasi ini SPA (client-side render), jadi meta tag
 * disetel setelah JavaScript jalan. Cukup untuk tab browser dan crawler
 * modern, tapi crawler yang tidak menjalankan JS hanya melihat nilai
 * default di index.html. Kalau butuh SEO sungguhan, halaman ini perlu
 * di-render di server (React Router framework mode / SSR).
 */
export function useSEO({ title, description, keywords }: Seo) {
  useEffect(() => {
    const fullTitle = `${title} — ${SITE_NAME}`
    document.title = fullTitle

    setMeta('name', 'description', description)
    if (keywords) setMeta('name', 'keywords', keywords)

    // Open Graph — dipakai saat link dibagikan di WhatsApp/Twitter dll
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
  }, [title, description, keywords])
}

/**
 * Cari meta tag yang sudah ada lalu ganti isinya; buat baru kalau belum ada.
 * Sengaja tidak menghapus tag saat unmount — halaman berikutnya akan
 * menimpanya, dan menghapus dulu bikin meta sempat kosong di antara navigasi.
 */
function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}
