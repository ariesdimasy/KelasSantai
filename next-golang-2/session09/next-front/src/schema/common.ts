import { z } from 'zod'

/**
 * Backend memakai `gorm.Model` yang TIDAK punya json tag, jadi id dan
 * timestamp keluar sebagai "ID" / "CreatedAt" (huruf besar).
 *
 * Khusus Category ada field `ID uint json:"id"` eksplisit yang menutupi
 * gorm.Model.ID, sehingga response-nya punya DUA field:
 *   "ID": 0   <- dari gorm.Model, tidak pernah terisi
 *   "id": 1   <- yang asli
 *
 * Semua skema di folder ini menerima kedua bentuk lalu menormalkannya
 * jadi camelCase, supaya komponen React tidak perlu tahu soal keanehan ini.
 */
export const gormShape = {
  ID: z.number().optional(),
  id: z.number().optional(),
  CreatedAt: z.string().optional(),
  UpdatedAt: z.string().optional(),
}

export type GormRaw = {
  ID?: number
  id?: number
  CreatedAt?: string
  UpdatedAt?: string
}

/** Ambil id yang benar-benar terisi, lalu ubah timestamp jadi camelCase. */
export function normalizeGorm(raw: GormRaw) {
  return {
    // `id` didahulukan, tapi hanya kalau terisi — Category mengirim "ID": 0
    // sedangkan Product/User justru mengirim "ID" sebagai id yang asli.
    id: raw.id && raw.id > 0 ? raw.id : (raw.ID ?? 0),
    createdAt: raw.CreatedAt ?? '',
    updatedAt: raw.UpdatedAt ?? '',
  }
}

/** meta paginasi dari helpers.PaginationMeta di backend. */
export const paginationMetaSchema = z
  .object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    total_pages: z.number(),
  })
  .transform((m) => ({
    page: m.page,
    limit: m.limit,
    total: m.total,
    totalPages: m.total_pages,
  }))

export type PaginationMeta = z.output<typeof paginationMetaSchema>

/**
 * Envelope response sukses: { success, message, data }.
 * `data` dibungkus generic supaya tiap endpoint bisa menaruh skema isinya.
 */
export function envelopeSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data,
  })
}

/**
 * Envelope untuk endpoint list berpaginasi.
 * `data` bisa null saat tabel kosong (Go mengirim `null`, bukan `[]`),
 * jadi dinormalkan ke array kosong.
 */
export function listEnvelopeSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: z
      .array(item)
      .nullish()
      .transform((d) => d ?? []),
    meta: paginationMetaSchema.nullish(),
  })
}
