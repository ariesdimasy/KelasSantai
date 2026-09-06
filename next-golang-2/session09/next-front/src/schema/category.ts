import { z } from 'zod'
import { gormShape, normalizeGorm } from './common'

/** Bentuk kategori yang dipakai di UI. */
export const categorySchema = z
  .object({
    ...gormShape,
    name: z.string(),
    slug: z.string().nullish(),
    description: z.string().nullish(),
  })
  .transform((c) => ({
    ...normalizeGorm(c),
    name: c.name,
    slug: c.slug ?? '',
    description: c.description ?? '',
  }))

export type Category = z.output<typeof categorySchema>

// --- form ------------------------------------------------------------------
//
// Batasannya disamakan dengan tag `validate:` di models/category.go
// supaya error tidak baru muncul setelah request dikirim.

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  description: z.string().trim().max(1000, 'Deskripsi maksimal 1000 karakter'),
})

export type CategoryFormValues = z.input<typeof categoryFormSchema>
