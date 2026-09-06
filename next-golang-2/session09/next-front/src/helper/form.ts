import type { z } from 'zod'
import { ApiError } from '../api/client'

export type FieldErrors = Record<string, string>

/**
 * Ubah ZodError jadi map { namaField: pesan } supaya mudah ditempel
 * ke props `error` milik komponen di components/Field.tsx.
 *
 * Kalau satu field punya beberapa error, yang pertama saja yang dipakai —
 * menumpuk semua pesan malah bikin form berisik.
 */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    if (!(key in result)) result[key] = issue.message
  }
  return result
}

/**
 * Petakan error validasi dari backend ke field form.
 *
 * Backend membalas `errors` dalam snake_case (hasil toSnake di
 * validator/validator.go), mis. { confirm_password: "..." }, sedangkan
 * form memakai camelCase. Konversinya dilakukan di sini.
 */
export function apiFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof ApiError)) return {}

  const result: FieldErrors = {}
  for (const [key, message] of Object.entries(error.fieldErrors)) {
    result[snakeToCamel(key)] = message
  }
  return result
}

/** Pesan yang aman ditampilkan ke user dari error apa pun. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan yang tidak diketahui'
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
}
