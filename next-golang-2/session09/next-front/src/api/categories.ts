import { envelopeSchema } from '../schema/common'
import { categorySchema, type CategoryFormValues } from '../schema/category'
import { z } from 'zod'
import { request } from './client'

/**
 * GET /categories — publik, TIDAK berpaginasi.
 * `data` bisa null saat tabel kosong, jadi dinormalkan ke array.
 */
export async function listCategories(keyword?: string) {
  const raw = await request<unknown>({
    method: 'GET',
    url: '/categories',
    params: { keyword: keyword || undefined },
  })

  const schema = envelopeSchema(
    z
      .array(categorySchema)
      .nullish()
      .transform((d) => d ?? []),
  )
  return schema.parse(raw).data
}

/** GET /categories/:id — publik. */
export async function getCategory(id: number) {
  const raw = await request<unknown>({ method: 'GET', url: `/categories/${id}` })
  return envelopeSchema(categorySchema).parse(raw).data
}

/** POST /categories — admin. Slug dibuat otomatis oleh backend dari nama. */
export async function createCategory(values: CategoryFormValues) {
  const raw = await request<unknown>({
    method: 'POST',
    url: '/categories',
    data: { name: values.name, description: values.description },
  })
  return envelopeSchema(categorySchema).parse(raw).data
}

/** PUT /categories/:id — admin, partial update. */
export async function updateCategory(id: number, values: CategoryFormValues) {
  const raw = await request<unknown>({
    method: 'PUT',
    url: `/categories/${id}`,
    data: { name: values.name, description: values.description },
  })
  return envelopeSchema(categorySchema).parse(raw).data
}

/**
 * DELETE /categories/:id — admin.
 * Backend menolak (409) kalau kategori masih dipakai produk.
 */
export async function deleteCategory(id: number) {
  await request<unknown>({ method: 'DELETE', url: `/categories/${id}` })
}
