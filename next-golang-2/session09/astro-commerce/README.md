# Astro Commerce

Frontend e-commerce untuk materi bootcamp: **storefront** (pembeli) + **dashboard** (admin)
dalam satu aplikasi Astro, dengan backend [`../fiber-api`](../fiber-api).

Stack: TypeScript · Astro (SSR) · React · Tailwind CSS v4 · shadcn/ui · lucide · zustand · zod · date-fns · JWT (jose)

---

## 1. Menjalankan

```bash
# 1. Backend (terminal 1) — butuh MySQL sesuai fiber-api/.env
cd ../fiber-api
go run index.go            # http://localhost:3000

# 2. Frontend (terminal 2)
cd ../astro-commerce
cp .env.example .env       # lalu isi AUTH_SECRET
npm install
npm run dev                # http://localhost:4321
```

Perintah lain:

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | dev server + HMR |
| `npm run build` | build produksi ke `dist/` |
| `npm start` | jalankan hasil build (`node ./dist/server/entry.mjs`) |
| `npm run check` | type check seluruh `.astro`/`.ts`/`.tsx` |

Frontend **tetap bisa dijalankan tanpa fiber-api**: katalog akan kosong dan muncul banner
peringatan, sementara login, dashboard, dan checkout tetap berfungsi memakai store lokal.

### Akun demo

Dibuat otomatis saat pertama kali aplikasi dijalankan:

| Role | Email | Password | Masuk ke |
| --- | --- | --- | --- |
| admin | `admin@astro.dev` | `admin123` | `/dashboard` |
| user | `user@astro.dev` | `user123` | `/home` |

---

## 2. Peta halaman

**Storefront**

| Route | Isi |
| --- | --- |
| `/` | landing: hero, keunggulan, katalog (search + filter kategori + sort + paginasi), info & FAQ |
| `/products/:id` | detail produk + SEO (OG image, JSON-LD `Product` & `BreadcrumbList`) + produk serupa |
| `/cart` | keranjang: ubah jumlah, hapus, ringkasan + estimasi ongkir |
| `/checkout` | 🔒 alamat pengiriman, metode pembayaran, buat pesanan |
| `/orders` | 🔒 riwayat pesanan (admin melihat semua pesanan) |
| `/profile` | 🔒 ubah nama, email, password |
| `/home` | 🔒 halaman ringkasan milik user (protected route yang diminta di skill.md) |
| `/signin`, `/register` | autentikasi; mendukung `?redirect=` |

**Dashboard** (semua 🔒 admin)

| Route | Isi |
| --- | --- |
| `/dashboard` | ringkasan: jumlah produk/kategori/user/pesanan, stok menipis, pesanan terbaru |
| `/dashboard/products` | CRUD produk + upload/hapus 1 image per produk |
| `/dashboard/categories` | CRUD kategori (nama, slug, deskripsi) |
| `/dashboard/users` | CRUD user termasuk pengaturan role |

🔒 = dijaga [`src/middleware.ts`](src/middleware.ts). Belum login → `/signin?redirect=…`;
sudah login tapi bukan admin → `/home?error=admin-only`.

---

## 3. Arsitektur

```
browser ──► Astro API route (BFF) ──► fiber-api (MySQL)
                    │
                    └────────────────► .data/db.json (store lokal)
```

Browser **tidak pernah** memanggil fiber-api langsung. Semua request lewat Astro API route
(`src/pages/api/**`) supaya:

- tidak ada masalah CORS dan URL backend tidak bocor ke client,
- response GORM (`ID`, `CreatedAt`, `category_id`) dinormalisasi dulu jadi tipe camelCase
  di [`src/lib/fiber.ts`](src/lib/fiber.ts), jadi komponen React tidak ikut berubah kalau
  bentuk response backend berubah,
- token JWT bisa disimpan di cookie **httpOnly** (tidak bisa dibaca JavaScript).

### Siapa melayani apa

| Operasi | Ditangani |
| --- | --- |
| List & detail produk | fiber-api `GET /api/v1/products`, `/products/:id` |
| Tambah produk (kategori dari MySQL) | fiber-api `POST /api/v1/products` |
| Upload / ganti / hapus image produk | fiber-api `POST·PUT·DELETE /api/v1/products/:id/image` |
| List kategori | fiber-api `GET /api/v1/categories`; **fallback**: diturunkan dari relasi `category` pada daftar produk |
| Update / delete produk | dicoba ke fiber-api; kalau dijawab 404/405 → overlay lokal |
| CRUD kategori | store lokal |
| Auth, JWT, CRUD user | store lokal |
| Order (checkout) | store lokal |

Store lokal = satu file JSON `.data/db.json` (di-gitignore) yang dikelola
[`src/lib/server/store.ts`](src/lib/server/store.ts). Isinya:

- `users` — tabel user + hash password (scrypt dari `node:crypto`)
- `orders` — hasil checkout
- `categories` / `products` — hanya **overlay**: `created` (record lokal, id mulai `900000`),
  `patches` (perubahan atas record milik fiber-api), `deleted` (tombstone)

Produk & kategori dari fiber-api tetap jadi sumber utama; overlay ditempelkan saat dibaca
([`src/lib/server/catalog.ts`](src/lib/server/catalog.ts)). Di dashboard, kolom **Sumber**
menunjukkan asal setiap baris (`fiber-api` atau `lokal`).

### Kalau endpoint fiber-api sudah tersedia

Frontend sudah **mencoba endpoint asli lebih dulu**, jadi begitu backend dilengkapi,
data otomatis pindah ke MySQL tanpa mengubah kode frontend. Kontrak yang diharapkan:

```http
PUT    /api/v1/products/:id     { name, description, price, stock, category, is_active }
DELETE /api/v1/products/:id
GET    /api/v1/categories       -> { success, data: [ { id, name, slug, description } ] }
POST   /api/v1/categories       { name, slug, description }
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id
POST   /api/v1/auth/register    { name, email, password }
POST   /api/v1/auth/login       { email, password } -> { data: { token, user } }
GET    /api/v1/users            (admin)
POST   /api/v1/users            { name, email, password, role }
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
POST   /api/v1/orders           { items: [{ product_id, quantity }], recipient, payment_method }
```

Langkah migrasinya:

1. **Produk update/delete** — tidak ada perubahan frontend; hapus saja cabang overlay di
   `updateProduct`/`deleteProduct` bila ingin bersih.
2. **Kategori** — `GET /categories` langsung dipakai begitu tersedia; pindahkan
   `createCategory`/`updateCategory`/`deleteCategory` ke `fiberFetch`.
3. **Auth & user** — ganti isi `signSession`/`verifySession`
   ([`src/lib/server/jwt.ts`](src/lib/server/jwt.ts)) agar memakai token dari backend, dan
   arahkan `src/lib/server/users.ts` ke endpoint `/users`. Payload JWT sudah memakai klaim
   standar (`sub`, `name`, `email`, `role`).
4. **Order** — pindahkan `createOrder` ke fiber-api; di sana stok bisa dikurangi dalam satu
   transaksi (`database.DB.Transaction`, lihat `CreateCategoryAndProduct`). Frontend sengaja
   **tidak** mengurangi stok karena itu harus atomik dengan pembuatan order.

---

## 4. Struktur folder

```
src/
├─ components/
│  ├─ ui/               # shadcn/ui (button, input, dialog, select, table, …)
│  ├─ common/           # Field (label+error), WarningBanner
│  ├─ storefront/       # Header, Footer, ProductCard, ProductBrowser, CartView,
│  │                    # CheckoutForm, SignInForm, RegisterForm, ProfileForm, AddToCartButton
│  └─ dashboard/        # DashboardTopbar, ProductManager, CategoryManager, UserManager
├─ hooks/use-hydrated.ts
├─ layouts/             # BaseLayout (SEO), StoreLayout, DashboardLayout
├─ lib/
│  ├─ api.ts            # client browser -> /api/** (+ ApiError dengan error per-field)
│  ├─ fiber.ts          # client server -> fiber-api + normalisasi response GORM
│  ├─ schemas.ts        # semua schema zod (dipakai di browser DAN server)
│  ├─ types.ts, utils.ts
│  └─ server/           # catalog, users, orders, store, jwt, password, uploads, http, errors
├─ pages/
│  ├─ api/              # BFF: auth, products, categories, users, orders, uploads
│  └─ *.astro           # halaman storefront + dashboard/
├─ stores/              # zustand: cart (persist localStorage), session
├─ middleware.ts        # verifikasi JWT + proteksi route
└─ styles/global.css    # token tema shadcn (Tailwind v4)
```

---

## 5. Catatan implementasi

**Validasi ganda.** Schema zod di `src/lib/schemas.ts` dipakai di browser (feedback cepat) dan
di server (karena input dari browser tidak boleh dipercaya). Batas panjang disamakan dengan tag
`validate:` pada `fiber-api/models/product.go`.

**Harga dihitung ulang di server.** Checkout hanya mengirim `productId` + `quantity`; harga,
subtotal, dan ongkir diambil dari katalog di server. Tanpa ini, siapa pun bisa checkout dengan
mengirim `price: 1` dari devtools.

**Upload image.** Satu produk = satu image (mengikuti kolom `Product.Image` di backend).
Validasi meniru `fiber-api/helpers/upload.go`: maksimal 2 MB, hanya jpg/png/webp, dan isi file
diperiksa lewat *magic bytes* — bukan hanya ekstensi. Nama file dibuat ulang di server
(`product_<id>_<timestamp>.png`) agar aman dari path traversal.

**Keranjang di localStorage.** Bisa belanja tanpa login dan tidak ada request per klik.
Karena island juga dirender di server, komponen yang bergantung pada keranjang menunggu
`useHydrated()` dulu supaya tidak terjadi hydration mismatch.

**Islands.** Hanya bagian interaktif yang dikirim sebagai JavaScript: `client:load` untuk header,
form, dan tabel dashboard; `client:visible` untuk kartu produk di bawah layar; `client:idle`
untuk notifikasi. Katalog tetap dirender di server lebih dulu supaya terbaca mesin pencari.

**SEO.** `BaseLayout` mengurus title, meta description, canonical, Open Graph, dan Twitter Card;
halaman detail produk menambahkan JSON-LD `Product` (harga + ketersediaan) dan `BreadcrumbList`.
Halaman privat (`/dashboard`, `/cart`, `/profile`, …) diberi `noindex`.

**Proteksi CSRF.** Astro memblokir request non-GET tanpa header `Origin` yang cocok. Kalau
menguji API dengan curl, sertakan `-H "Origin: http://localhost:4321"`.

---

## 6. Ceklis fitur skill.md

- [x] Header (logo, cart + badge, profil, signin, register) & footer (link halaman + sosial media)
- [x] Product card (image, nama, harga, tombol add to cart)
- [x] Halaman detail produk (image, nama, harga, deskripsi, stok, kategori) + SEO
- [x] Search bar & filter kategori (+ sort dan paginasi)
- [x] Cart page (tambah, hapus, ubah jumlah)
- [x] Checkout page, profile page, signin page, register page
- [x] Protected route `/home` + pembagian role: admin → dashboard, user → storefront
- [x] Dashboard: manajemen produk (tambah, edit, hapus, upload 1 image)
- [x] Dashboard: manajemen kategori & manajemen user
- [x] Teknologi: TypeScript, Tailwind, zustand, shadcn/ui, lucide, date-fns, Astro + React, JWT, zod
