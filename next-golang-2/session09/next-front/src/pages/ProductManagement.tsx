import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  listProducts,
  updateProduct,
  uploadProductImage,
} from '../api/products'
import { listCategories } from '../api/categories'
import { productFormSchema, type Product, type ProductFormValues } from '../schema/product'
import type { Category } from '../schema/category'
import type { PaginationMeta } from '../schema/common'
import { Modal } from '../components/Modal'
import { SelectField, TextAreaField, TextField } from '../components/Field'
import { Pagination } from '../components/Pagination'
import { Alert, EmptyState, Spinner } from '../components/Feedback'
import { formatRupiah, productImageUrl } from '../helper/format'
import { useSEO } from '../helper/seo'
import { apiFieldErrors, errorMessage, zodFieldErrors, type FieldErrors } from '../helper/form'

const PER_PAGE = 10

const emptyForm: ProductFormValues = {
  name: '',
  description: '',
  price: '' as unknown as number, // input number mulai kosong, dikonversi oleh z.coerce
  stock: 0,
  categoryId: 0,
  isActive: true,
}

export default function ProductManagement() {
  useSEO({
    title: 'Kelola Produk',
    description: 'Tambah, ubah, hapus produk, dan atur gambar produk SantaiStore.',
    keywords: 'kelola produk, admin produk, crud produk, upload gambar',
  })

  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [notice, setNotice] = useState('')

  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [form, setForm] = useState<ProductFormValues>(emptyForm)
  const [formErrors, setFormErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Product | null>(null)
  const [removing, setRemoving] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Upload gambar: satu input file dipakai bersama, produk mana yang
  // sedang diunggah disimpan di state.
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setListError('')
    listProducts({ page, limit: PER_PAGE })
      .then((result) => {
        setProducts(result.items)
        setMeta(result.meta)
      })
      .catch((err) => setListError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(load, [load])

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err) => setListError(errorMessage(err)))
  }, [])

  const openCreate = () => {
    setEditing('new')
    // Kategori pertama dipilih otomatis supaya form tidak langsung invalid
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? 0 })
    setFormErrors({})
    setFormError('')
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      isActive: product.isActive,
    })
    setFormErrors({})
    setFormError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const parsed = productFormSchema.safeParse(form)
    if (!parsed.success) {
      setFormErrors(zodFieldErrors(parsed.error))
      return
    }
    setFormErrors({})
    setSaving(true)

    try {
      if (editing === 'new') {
        await createProduct(parsed.data)
        setNotice(`Produk "${parsed.data.name}" berhasil dibuat.`)
      } else if (editing) {
        await updateProduct(editing.id, parsed.data)
        setNotice(`Produk "${parsed.data.name}" berhasil diperbarui.`)
      }
      setEditing(null)
      load()
    } catch (err) {
      // Backend memakai key `category` untuk id kategori, sedangkan
      // form memakai categoryId — samakan supaya errornya nempel.
      const mapped = apiFieldErrors(err)
      if (mapped.category) mapped.categoryId = mapped.category
      setFormErrors(mapped)
      setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteError('')
    setRemoving(true)

    try {
      await deleteProduct(deleting.id)
      setNotice(`Produk "${deleting.name}" berhasil dihapus.`)
      setDeleting(null)
      load()
    } catch (err) {
      setDeleteError(errorMessage(err))
    } finally {
      setRemoving(false)
    }
  }

  const pickImage = (product: Product) => {
    setUploadTarget(product)
    fileInputRef.current?.click()
  }

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const target = uploadTarget

    // Reset value supaya memilih file yang sama dua kali tetap memicu onChange
    e.target.value = ''
    if (!file || !target) return

    setUploading(true)
    setListError('')
    try {
      // Produk yang sudah punya image harus pakai PUT (POST akan 409)
      await uploadProductImage(target.id, file, Boolean(target.image))
      setNotice(`Gambar "${target.name}" berhasil disimpan.`)
      load()
    } catch (err) {
      setListError(errorMessage(err))
    } finally {
      setUploading(false)
      setUploadTarget(null)
    }
  }

  const handleRemoveImage = async (product: Product) => {
    setListError('')
    try {
      await deleteProductImage(product.id)
      setNotice(`Gambar "${product.name}" berhasil dihapus.`)
      load()
    } catch (err) {
      setListError(errorMessage(err))
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="mt-1 text-sm text-gray-600">
            {meta ? `${meta.total} produk` : 'Memuat…'} · gambar diunggah terpisah setelah produk
            dibuat
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Buat kategori dulu' : undefined}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          + Tambah Produk
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <Alert tone="info" className="mt-5">
          Belum ada kategori. Buat minimal satu kategori dulu di menu Kelola Kategori — produk
          wajib punya kategori.
        </Alert>
      )}
      {notice && (
        <Alert tone="success" className="mt-5">
          {notice}
        </Alert>
      )}
      {listError && (
        <Alert tone="error" className="mt-5">
          {listError}
        </Alert>
      )}
      {uploading && (
        <Alert tone="info" className="mt-5">
          Mengunggah gambar…
        </Alert>
      )}

      {/* Input file tersembunyi — dipicu tombol per baris produk */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChosen}
      />

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState title="Belum ada produk" description="Tambahkan produk pertama." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Produk</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Harga</th>
                  <th className="px-5 py-3">Stok</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const image = productImageUrl(product.image)
                  return (
                    <tr key={product.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {image ? (
                              <img src={image} alt="" className="size-full object-cover" />
                            ) : (
                              <div className="flex size-full items-center justify-center text-[10px] text-gray-400">
                                n/a
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{product.name}</p>
                            <div className="mt-0.5 flex gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => pickImage(product)}
                                className="font-medium text-teal-700 hover:underline"
                              >
                                {product.image ? 'Ganti gambar' : 'Unggah gambar'}
                              </button>
                              {product.image && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(product)}
                                  className="font-medium text-red-600 hover:underline"
                                >
                                  Hapus gambar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {product.category?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={product.stock === 0 ? 'text-red-600' : 'text-gray-700'}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            product.isActive
                              ? 'rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700'
                              : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                          }
                        >
                          {product.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleting(product)
                              setDeleteError('')
                            }}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Tambah Produk' : 'Ubah Produk'}
        onClose={() => setEditing(null)}
      >
        <form className="flex flex-col gap-4" onSubmit={handleSave} noValidate>
          {formError && <Alert tone="error">{formError}</Alert>}

          <TextField
            label="Nama Produk"
            name="name"
            value={form.name}
            error={formErrors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextAreaField
            label="Deskripsi"
            name="description"
            rows={3}
            value={form.description}
            error={formErrors.description}
            hint="Minimal 10 karakter"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Harga (Rp)"
              name="price"
              type="number"
              min={1}
              value={String(form.price ?? '')}
              error={formErrors.price}
              onChange={(e) => setForm({ ...form, price: e.target.value as unknown as number })}
            />
            <TextField
              label="Stok"
              name="stock"
              type="number"
              min={0}
              value={String(form.stock ?? '')}
              error={formErrors.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value as unknown as number })}
            />
          </div>

          <SelectField
            label="Kategori"
            name="categoryId"
            value={String(form.categoryId ?? '')}
            error={formErrors.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
          >
            <option value="">— pilih kategori —</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>

          {/* Status hanya relevan saat edit: CreateProduct di backend
              selalu menyetel IsActive = true. */}
          {editing !== 'new' && (
            <label className="flex items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Produk aktif (tampil di katalog)
            </label>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        title="Hapus Produk"
        onClose={() => setDeleting(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={removing}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {removing ? 'Menghapus…' : 'Hapus'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Hapus produk <span className="font-semibold text-gray-900">{deleting?.name}</span>?
          Backend memakai soft delete, jadi datanya masih bisa dipulihkan lewat database.
        </p>
        {deleteError && (
          <Alert tone="error" className="mt-4">
            {deleteError}
          </Alert>
        )}
      </Modal>
    </>
  )
}
