import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../helper/auth'

type Props = {
  /** true = wajib role admin, bukan cuma sudah login. */
  requireAdmin?: boolean
  /** Ke mana diarahkan kalau belum login. */
  redirectTo?: string
}

/**
 * Penjaga route di sisi client.
 *
 * Ini murni soal pengalaman pemakai — token tetap diverifikasi ulang oleh
 * middleware Protected()/RequireRole() di backend. Jadi walaupun seseorang
 * mengakali localStorage untuk membuka /dashboard, semua request datanya
 * tetap ditolak 401/403 oleh server.
 */
export function ProtectedRoute({ requireAdmin = false, redirectTo = '/login' }: Props) {
  const { isLoggedIn, isAdmin } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    // `state.from` dipakai halaman login untuk kembali ke tujuan semula
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
