import { envelopeSchema } from '../schema/common'
import { loginResultSchema, userSchema, type LoginFormValues, type RegisterFormValues } from '../schema/auth'
import { request } from './client'

/** POST /auth/login */
export async function login(values: LoginFormValues) {
  const raw = await request<unknown>({
    method: 'POST',
    url: '/auth/login',
    data: { email: values.email, password: values.password },
  })
  return envelopeSchema(loginResultSchema).parse(raw).data
}

/**
 * POST /auth/register
 *
 * Backend menamai field-nya `confirm_password` (snake_case), sedangkan
 * form memakai camelCase — konversinya dilakukan di sini supaya komponen
 * tidak perlu tahu bentuk payload API.
 */
export async function register(values: RegisterFormValues) {
  const raw = await request<unknown>({
    method: 'POST',
    url: '/auth/register',
    data: {
      name: values.name,
      email: values.email,
      password: values.password,
      confirm_password: values.confirmPassword,
    },
  })
  return envelopeSchema(userSchema).parse(raw).data
}

/** GET /auth/me — butuh token. */
export async function getMe() {
  const raw = await request<unknown>({ method: 'GET', url: '/auth/me' })
  return envelopeSchema(userSchema).parse(raw).data
}
