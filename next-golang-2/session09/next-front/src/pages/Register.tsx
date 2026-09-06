import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login, register } from '../api/auth'
import { registerFormSchema, type RegisterFormValues } from '../schema/auth'
import { setSession } from '../helper/auth'
import { TextField } from '../components/Field'
import { Alert } from '../components/Feedback'
import { useSEO } from '../helper/seo'
import { apiFieldErrors, errorMessage, zodFieldErrors, type FieldErrors } from '../helper/form'

const empty: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  useSEO({
    title: 'Daftar Akun',
    description: 'Buat akun SantaiStore gratis untuk mulai berbelanja.',
    keywords: 'daftar, register, buat akun',
  })

  const navigate = useNavigate()
  const [values, setValues] = useState<RegisterFormValues>(empty)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof RegisterFormValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const parsed = registerFormSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitting(true)

    try {
      await register(parsed.data)

      // Registrasi tidak mengembalikan token, jadi langsung login supaya
      // user tidak perlu mengisi email & password dua kali.
      const session = await login({ email: parsed.data.email, password: parsed.data.password })
      setSession(session.access_token, session.user)
      navigate('/', { replace: true })
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
        <h1 className="text-xl font-bold text-gray-900">Daftar</h1>
        <p className="mt-1 text-sm text-gray-600">Sudah punya akun? </p>
        <Link to="/login" className="text-sm font-medium text-teal-700 hover:underline">
          Masuk di sini
        </Link>

        {formError && (
          <Alert tone="error" className="mt-5">
            {formError}
          </Alert>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Nama"
            name="name"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onChange={set('name')}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={set('email')}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            error={errors.password}
            hint="Minimal 6 karakter"
            onChange={set('password')}
          />
          <TextField
            label="Konfirmasi Password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={set('confirmPassword')}
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? 'Mendaftarkan…' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  )
}
