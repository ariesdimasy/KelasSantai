import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../helper/auth'
import { cn } from '../helper/format'

const menu = [
  { to: '/dashboard', label: 'Ringkasan', end: true },
  { to: '/dashboard/products', label: 'Kelola Produk', end: false },
  { to: '/dashboard/categories', label: 'Kelola Kategori', end: false },
]

/** Layout dashboard admin: sidebar kiri + isi halaman. */
export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/dashboard/login')
  }

  return (
    <div className="flex min-h-dvh bg-gray-50">
      <aside className="hidden w-60 shrink-0 flex-col border-e border-gray-200 bg-white p-4 md:flex">
        <Link to="/" className="px-2 py-1.5 text-lg font-bold text-gray-900">
          Santai<span className="text-teal-600">Admin</span>
        </Link>

        <nav className="mt-6 flex flex-col gap-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-gray-200 pt-4">
          <p className="px-3 text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="px-3 text-xs text-gray-500">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="flex-1">
        {/* Navigasi versi mobile — sidebar disembunyikan di layar kecil */}
        <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium',
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main className="mx-auto max-w-5xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
