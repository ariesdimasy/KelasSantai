import { z } from 'zod'
import { gormShape, normalizeGorm } from './common'
import { categorySchema } from './category'

export const productSchema = z
  .object({
    ...gormShape,
    name: z.string(),
    description: z.string().nullish(),
    price: z.number(),
    stock: z.number(),
    is_active: z.boolean(),
    image: z.string().nullish(),
    category_id: z.number(),
    // `category` hanya terisi kalau backend memanggil Preload("Category")
    category: categorySchema.nullish(),
  })
  .transform((p) => ({
    ...normalizeGorm(p),
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    stock: p.stock,
    isActive: p.is_active,
    image: p.image ?? '',
    categoryId: p.category_id,
    category: p.category ?? null,
  }))

export type Product = z.output<typeof productSchema>

/**
 * Response POST/PUT /products/:id/image.
 *
 * Endpoint image TIDAK mengembalikan produk lengkap — hanya ringkasan
 * { id, name, image, image_url } (lihat saveProductImage di
 * handlers/product_image_handler.go), jadi productSchema tidak cocok di sini.
 *
 * `image_url` sudah berupa URL absolut buatan backend, jadi bisa langsung
 * dipakai tanpa productImageUrl().
 */
export const productImageResultSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    image_url: z.string().nullish(),
  })
  .transform((r) => ({
    id: r.id,
    name: r.name,
    image: r.image,
    imageUrl: r.image_url ?? '',
  }))

export type ProductImageResult = z.output<typeof productImageResultSchema>

// --- form ------------------------------------------------------------------
//
// Mengikuti CreateProductRequest di models/product.go:
//   name        min=3  max=100
//   description min=10 max=1000
//   price       gt=0
//   stock       gte=0
//   category    required (id kategori)

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  description: z
    .string()
    .trim()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(1000, 'Deskripsi maksimal 1000 karakter'),
  // Input number di HTML selalu string, jadi dikonversi dulu baru divalidasi
  price: z.coerce.number().int('Harga harus bilangan bulat').positive('Harga harus lebih dari 0'),
  stock: z.coerce.number().int('Stok harus bilangan bulat').min(0, 'Stok tidak boleh negatif'),
  categoryId: z.coerce.number().int().positive('Kategori wajib dipilih'),
  isActive: z.boolean(),
})

export type ProductFormValues = z.input<typeof productFormSchema>
export type ProductFormParsed = z.output<typeof productFormSchema>
