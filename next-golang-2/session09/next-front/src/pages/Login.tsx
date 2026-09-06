import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { login } from '../api/auth'
import { loginFormSchema, type LoginFormValues } from '../schema/auth'
import { setSession } from '../helper/auth'
import { TextField } from '../components/Field'
import { Alert } from '../components/Feedback'
import { useSEO } from '../helper/seo'
import { apiFieldErrors, errorMessage, zodFieldErrors, type FieldErrors } from '../helper/form'

export default function Login() {
  useSEO({
    title: 'Masuk',
    description: 'Masuk ke akun SantaiStore untuk mulai berbelanja.',
    keywords: 'login, masuk, akun',
  })

  const navigate = useNavigate()
  const location = useLocation()
  // Diisi ProtectedRoute saat user diarahkan ke sini dari halaman terlindungi
  const from = (location.state as { from?: string } | null)?.from

  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // biar gak refresh
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
      setSession(result.access_token, result.user)
      // Admin yang login dari halaman publik tetap diarahkan ke tujuan
      // semula (kalau ada), bukan dipaksa ke dashboard.
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setErrors(apiFieldErrors(err))
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-gray-200 bg-white p-7">
        <h1 className="text-xl font-bold text-gray-900">Masuk</h1>
        <p className="mt-1 text-sm text-gray-600">Belum punya akun? </p>
        <Link to="/register" className="text-sm font-medium text-teal-700 hover:underline">
          Daftar di sini
        </Link>

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
            className="mt-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
          Admin? Gunakan{' '}
          <Link to="/dashboard/login" className="font-medium text-teal-700 hover:underline">
            halaman login dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
