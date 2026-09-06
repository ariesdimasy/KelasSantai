import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import 'preline'

import { Layout } from './components/Layout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Dashboard from './pages/Dashboard'
import DashboardLogin from './pages/DashboardLogin'
import ProductManagement from './pages/ProductManagement'
import CategoryManagement from './pages/CategoryManagement'
import { Forbidden, NotFound } from './pages/ErrorPages'

export default function App() {
  const location = useLocation()

  useEffect(() => {
    // Preline mencari komponennya lewat query DOM saat halaman dimuat.
    // React Router mengganti isi halaman tanpa reload, jadi autoInit
    // perlu dipanggil ulang setiap pindah route.
    window.HSStaticMethods?.autoInit()

    // Scroll ke atas — kalau tidak, pindah halaman dari posisi ter-scroll
    // membuat halaman baru seolah terbuka di tengah.
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <Routes>
      {/* ── PUBLIK ── */}
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ── DASHBOARD ── login-nya di luar guard, kalau tidak
           user yang belum login akan diarahkan berputar-putar. */}
      <Route path="dashboard/login" element={<DashboardLogin />} />

      <Route
        path="dashboard"
        element={<ProtectedRoute requireAdmin redirectTo="/dashboard/login" />}
      >
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
        </Route>
      </Route>
    </Routes>
  )
}
