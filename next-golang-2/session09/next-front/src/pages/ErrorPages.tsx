import { Link } from 'react-router'
import { useSEO } from '../helper/seo'

export function NotFound() {
  useSEO({
    title: 'Halaman Tidak Ditemukan',
    description: 'Halaman yang kamu cari tidak ada di SantaiStore.',
  })

  return (
    <Shell
      code="404"
      title="Halaman tidak ditemukan"
      description="Alamat yang kamu buka tidak ada atau sudah dipindahkan."
    />
  )
}

export function Forbidden() {
  useSEO({
    title: 'Akses Ditolak',
    description: 'Kamu tidak punya izin membuka halaman ini.',
  })

  return (
    <Shell
      code="403"
      title="Akses ditolak"
      description="Halaman ini hanya untuk admin. Masuk dengan akun admin lewat login dashboard."
      action={{ to: '/dashboard/login', label: 'Login Dashboard' }}
    />
  )
}

function Shell({
  code,
  title,
  description,
  action = { to: '/', label: 'Kembali ke Beranda' },
}: {
  code: string
  title: string
  description: string
  action?: { to: string; label: string }
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-5xl font-bold text-teal-600">{code}</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <Link
        to={action.to}
        className="mt-7 inline-block rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
      >
        {action.label}
      </Link>
    </div>
  )
}
