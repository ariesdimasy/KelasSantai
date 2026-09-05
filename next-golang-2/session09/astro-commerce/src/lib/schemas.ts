/**
 * Semua validasi input memakai zod dan dipakai DUA KALI:
 *  - di browser (form React) supaya user dapat feedback cepat,
 *  - di server (Astro API route) karena input dari browser tidak boleh dipercaya.
 *
 * Aturan panjang teks disamakan dengan tag `validate:` pada
 * fiber-api/models/product.go agar tidak ada validasi yang lolos di frontend
 * tapi ditolak backend.
 */
import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'user']);

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
    email: z.string().trim().toLowerCase().pipe(z.email('Format email tidak valid')),
    password: z.string().min(6, 'Password minimal 6 karakter').max(72, 'Password maksimal 72 karakter'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  });

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Format email tidak valid')),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().trim().toLowerCase().pipe(z.email('Format email tidak valid')),
  /** kosongkan bila tidak ingin ganti password */
  password: z
    .string()
    .max(72, 'Password maksimal 72 karakter')
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .refine((value) => value === undefined || value.length >= 6, 'Password minimal 6 karakter'),
});

/** Dipakai admin di halaman user management (bisa set role). */
export const userCreateSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  email: z.string().trim().toLowerCase().pipe(z.email('Format email tidak valid')),
  password: z.string().min(6, 'Password minimal 6 karakter').max(72, 'Password maksimal 72 karakter'),
  role: roleSchema,
});

export const userUpdateSchema = userCreateSchema.extend({
  password: z
    .string()
    .max(72, 'Password maksimal 72 karakter')
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .refine((value) => value === undefined || value.length >= 6, 'Password minimal 6 karakter'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(3, 'Nama kategori minimal 3 karakter').max(100, 'Maksimal 100 karakter'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(100, 'Maksimal 100 karakter')
    .regex(/^[a-z0-9-]*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda "-"')
    .optional(),
  description: z.string().trim().max(1000, 'Deskripsi maksimal 1000 karakter').default(''),
});

/** Sinkron dengan models.CreateProductRequest di fiber-api. */
export const productSchema = z.object({
  name: z.string().trim().min(3, 'Nama produk minimal 3 karakter').max(100, 'Maksimal 100 karakter'),
  description: z
    .string()
    .trim()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(1000, 'Deskripsi maksimal 1000 karakter'),
  price: z.coerce.number('Harga harus berupa angka').int('Harga harus bilangan bulat').positive('Harga harus lebih dari 0'),
  stock: z.coerce.number('Stok harus berupa angka').int('Stok harus bilangan bulat').min(0, 'Stok minimal 0'),
  categoryId: z.coerce.number('Kategori wajib dipilih').int().positive('Kategori wajib dipilih'),
  // catatan: JANGAN pakai z.coerce.boolean() — string "false" akan jadi true.
  isActive: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(3, 'Nama penerima minimal 3 karakter').max(100, 'Maksimal 100 karakter'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, 'Nomor telepon tidak valid'),
  address: z.string().trim().min(10, 'Alamat minimal 10 karakter').max(500, 'Maksimal 500 karakter'),
  city: z.string().trim().min(3, 'Kota minimal 3 karakter').max(100, 'Maksimal 100 karakter'),
  postalCode: z.string().trim().regex(/^[0-9]{5}$/, 'Kode pos harus 5 angka'),
  note: z.string().trim().max(500, 'Catatan maksimal 500 karakter').default(''),
  paymentMethod: z.enum(['transfer', 'cod', 'ewallet']),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive('Jumlah minimal 1'),
      }),
    )
    .min(1, 'Keranjang masih kosong'),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type SignInInput = z.input<typeof signInSchema>;
export type ProfileInput = z.input<typeof profileSchema>;
export type UserCreateInput = z.input<typeof userCreateSchema>;
export type UserUpdateInput = z.input<typeof userUpdateSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
export type ProductInput = z.input<typeof productSchema>;
export type CheckoutInput = z.input<typeof checkoutSchema>;

/**
 * Ubah ZodError menjadi map sederhana { field: "pesan" } — bentuk yang sama
 * dengan `errors` pada response fiber-api, jadi form bisa menampilkannya
 * dengan satu cara saja.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_';
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}

/** Helper: parse aman, hasilnya siap dikirim sebagai response API. */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): { ok: true; data: z.output<S> } | { ok: false; errors: Record<string, string> } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return { ok: true, data: parsed.data };
}
