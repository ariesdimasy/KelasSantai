import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../helper/auth'
import { cn } from '../helper/format'

/** Layout publik: navbar + isi halaman + footer. */
export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Navbar() {
  const { isLoggedIn, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition',
      isActive ? 'text-teal-700' : 'text-gray-600 hover:text-teal-700',
    )

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3.5">
        <Link to="/" className="text-lg font-bold text-gray-900">
          Santai<span className="text-teal-600">Store</span>
        </Link>

        <div className="flex items-center gap-5">
          <NavLink to="/" end className={link}>
            Beranda
          </NavLink>
          <NavLink to="/products" className={link}>
            Produk
          </NavLink>
          {isAdmin && (
            <NavLink to="/dashboard" className={link}>
              Dashboard
            </NavLink>
          )}
        </div>

        <div className="ms-auto flex items-center gap-2.5">
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Hai, <span className="font-medium text-gray-900">{user?.name}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-gray-500">
        <p className="font-semibold text-gray-800">SantaiStore</p>
        <p>E-commerce sederhana — latihan React + Fiber (Go).</p>
      </div>
    </footer>
  )
}
