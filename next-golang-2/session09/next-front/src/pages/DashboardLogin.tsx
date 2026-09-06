import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { login } from '../api/auth'
import { loginFormSchema, type LoginFormValues } from '../schema/auth'
import { clearSession, setSession, useAuth } from '../helper/auth'
import { TextField } from '../components/Field'
import { Alert } from '../components/Feedback'
import { useSEO } from '../helper/seo'
import { apiFieldErrors, errorMessage, zodFieldErrors, type FieldErrors } from '../helper/form'

/**
 * Login khusus dashboard — hanya role admin yang diloloskan.
 *
 * Kalau yang masuk ternyata bukan admin, sesinya langsung dibuang.
 * Membiarkannya login lalu ditolak di halaman berikutnya bikin user
 * bingung: seolah berhasil masuk tapi semua menu kosong.
 */
export default function DashboardLogin() {
  useSEO({
    title: 'Login Dashboard Admin',
    description: 'Halaman masuk khusus administrator SantaiStore.',
    keywords: 'login admin, dashboard, administrator',
  })

  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Sudah login sebagai admin → tidak perlu lihat form ini lagi
  if (isAdmin) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const parsed = loginFormSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitting(true)

    try {
      const result = await login(parsed.data)

      if (result.user.role !== 'admin') {
        clearSession()
        setFormError('Akun ini bukan admin. Gunakan halaman login biasa untuk berbelanja.')
        return
      }

      setSession(result.access_token, result.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors(apiFieldErrors(err))
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-7">
        <p className="text-xs font-semibold tracking-wide text-teal-600 uppercase">
          Area Administrator
        </p>
        <h1 className="mt-1.5 text-xl font-bold text-gray-900">Login Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Hanya akun dengan role <span className="font-medium">admin</span> yang bisa masuk.
        </p>

        {formError && (
          <Alert tone="error" className="mt-5">
            {formError}
          </Alert>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            error={errors.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? 'Memeriksa…' : 'Masuk Dashboard'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-block border-t border-gray-200 pt-4 text-xs text-gray-500 hover:text-teal-700"
        >
          ← Kembali ke toko
        </Link>
      </div>
    </div>
  )
}
