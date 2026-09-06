import { envelopeSchema, listEnvelopeSchema } from '../schema/common'
import { productImageResultSchema, productSchema, type ProductFormParsed } from '../schema/product'
import { request } from './client'

export type ProductListParams = {
  keyword?: string
  categoryId?: number
  page?: number
  limit?: number
}

/** GET /products — publik, berpaginasi. */
export async function listProducts(params: ProductListParams = {}) {
  const raw = await request<unknown>({
    method: 'GET',
    url: '/products',
    params: {
      keyword: params.keyword || undefined,
      // Backend menamainya category_id
      category_id: params.categoryId || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    },
  })

  const parsed = listEnvelopeSchema(productSchema).parse(raw)
  return { items: parsed.data, meta: parsed.meta ?? null }
}

/** GET /products/:id — publik. */
export async function getProduct(id: number) {
  const raw = await request<unknown>({ method: 'GET', url: `/products/${id}` })
  return envelopeSchema(productSchema).parse(raw).data
}

/**
 * POST /products — admin.
 *
 * Perhatikan: id kategori dikirim dengan key `category`, bukan `category_id`
 * (lihat tag json di CreateProductRequest).
 */
export async function createProduct(values: ProductFormParsed) {
  const raw = await request<unknown>({
    method: 'POST',
    url: '/products',
    data: {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      category: values.categoryId,
    },
  })
  return envelopeSchema(productSchema).parse(raw).data
}

/** PUT /products/:id — admin, partial update. */
export async function updateProduct(id: number, values: ProductFormParsed) {
  const raw = await request<unknown>({
    method: 'PUT',
    url: `/products/${id}`,
    data: {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      is_active: values.isActive,
      category: values.categoryId,
    },
  })
  return envelopeSchema(productSchema).parse(raw).data
}

/** DELETE /products/:id — admin, soft delete. */
export async function deleteProduct(id: number) {
  await request<unknown>({ method: 'DELETE', url: `/products/${id}` })
}

/**
 * POST /products/:id/image (atau PUT bila `replace`) — admin.
 *
 * multipart/form-data dengan field bernama "image". Content-Type sengaja
 * dikosongkan agar axios mengisinya sendiri lengkap dengan boundary.
 *
 * Balasannya BUKAN produk lengkap, hanya { id, name, image, image_url } —
 * karena itu skemanya productImageResultSchema, bukan productSchema.
 */
export async function uploadProductImage(id: number, file: File, replace = false) {
  const form = new FormData()
  form.append('image', file)

  const raw = await request<unknown>({
    method: replace ? 'PUT' : 'POST',
    url: `/products/${id}/image`,
    data: form,
    headers: { 'Content-Type': undefined },
  })
  return envelopeSchema(productImageResultSchema).parse(raw).data
}

/** DELETE /products/:id/image — admin. */
export async function deleteProductImage(id: number) {
  await request<unknown>({ method: 'DELETE', url: `/products/${id}/image` })
}
