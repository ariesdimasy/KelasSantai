import { z } from 'zod'
import { gormShape, normalizeGorm } from './common'

export const roleSchema = z.enum(['admin', 'user'])
export type Role = z.output<typeof roleSchema>

export const userSchema = z
  .object({
    ...gormShape,
    name: z.string(),
    email: z.string(),
    // Role bisa string kosong kalau baris lama belum punya nilai,
    // jadi jangan pakai enum ketat di sini — UI hanya menampilkannya.
    role: z.string(),
    is_active: z.boolean().nullish(),
    last_login_at: z.string().nullish(),
  })
  .transform((u) => ({
    ...normalizeGorm(u),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.is_active ?? true,
    lastLoginAt: u.last_login_at ?? null,
  }))

export type User = z.output<typeof userSchema>

/** Response POST /auth/login → { access_token, token_type, user } */
export const loginResultSchema = z.object({
  access_token: z.string(),
  token_type: z.string().nullish(),
  user: userSchema,
})

// --- form ------------------------------------------------------------------

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export type LoginFormValues = z.input<typeof loginFormSchema>

/**
 * Mengikuti RegisterRequest di models/user.go.
 * Batas 72 karakter berasal dari bcrypt — password lebih panjang dari itu
 * akan dipotong diam-diam oleh bcrypt, jadi ditolak lebih awal.
 */
export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Nama minimal 3 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid')
      .max(150, 'Email maksimal 150 karakter'),
    password: z
      .string()
      .min(6, 'Password minimal 6 karakter')
      .max(72, 'Password maksimal 72 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.input<typeof registerFormSchema>
