import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { clearSession, getToken } from '../helper/auth'

// `import.meta.env?` — optional chaining supaya modul ini tetap bisa
// di-import di luar Vite (mis. skrip node untuk mengetes layer api).
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3010'

export const client = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

/**
 * ApiError: satu bentuk error untuk seluruh aplikasi.
 *
 * Backend mengirim beberapa bentuk error yang berbeda:
 *   { success: false, error: "..." }                 <- helpers.BadRequest dsb
 *   { success: false, error: "...", errors: {...} }  <- validasi gagal
 *   { error: "Token diperlukan" }                    <- middleware auth
 *
 * `fieldErrors` diisi dari `errors` supaya form bisa menempelkan pesan
 * ke input yang bersangkutan.
 */
export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// --- REQUEST interceptor ----------------------------------------------------
// Menempelkan JWT ke setiap request supaya tiap pemanggilan tidak perlu
// mengurus header Authorization sendiri.
client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- RESPONSE interceptor ---------------------------------------------------
// Sukses: diteruskan apa adanya (di-parse zod oleh masing-masing modul api).
// Gagal: diseragamkan jadi ApiError.
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string; errors?: Record<string, string> }>) => {
    // Tidak ada response = server mati, CORS, atau timeout
    if (!error.response) {
      const offline = error.code === 'ECONNABORTED' ? 'Permintaan timeout.' : 'Tidak bisa menghubungi server.'
      return Promise.reject(new ApiError(`${offline} Pastikan API di ${API_BASE_URL} sudah jalan.`, 0))
    }

    const { status, data } = error.response
    const message = data?.error ?? data?.message ?? 'Terjadi kesalahan pada server'

    // 401 = token hilang/kedaluwarsa. Bersihkan sesi supaya UI tidak
    // menampilkan diri sebagai "sudah login" padahal tokennya mati.
    // Redirect TIDAK dilakukan di sini — itu tugas ProtectedRoute, biar
    // request di halaman publik tidak ikut memaksa pindah halaman.
    if (status === 401) {
      clearSession()
    }

    return Promise.reject(new ApiError(message, status, data?.errors ?? {}))
  },
)

/** Helper tipis supaya modul api di folder ini tidak berulang-ulang. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config)
  return response.data
}
