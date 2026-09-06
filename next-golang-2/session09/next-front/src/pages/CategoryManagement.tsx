import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../api/categories'
import { categoryFormSchema, type Category, type CategoryFormValues } from '../schema/category'
import { Modal } from '../components/Modal'
import { TextAreaField, TextField } from '../components/Field'
import { Alert, EmptyState, Spinner } from '../components/Feedback'
import { formatDate } from '../helper/format'
import { useSEO } from '../helper/seo'
import { apiFieldErrors, errorMessage, zodFieldErrors, type FieldErrors } from '../helper/form'

const emptyForm: CategoryFormValues = { name: '', description: '' }

export default function CategoryManagement() {
  useSEO({
    title: 'Kelola Kategori',
    description: 'Tambah, ubah, dan hapus kategori produk SantaiStore.',
    keywords: 'kelola kategori, admin kategori, crud kategori',
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [notice, setNotice] = useState('')

  // null = modal tertutup, 'new' = tambah, Category = edit
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [form, setForm] = useState<CategoryFormValues>(emptyForm)
  const [formErrors, setFormErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Category | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [removing, setRemoving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    listCategories()
      .then(setCategories)
      .catch((err) => setListError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const openCreate = () => {
    setEditing('new')
    setForm(emptyForm)
    setFormErrors({})
    setFormError('')
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setForm({ name: category.name, description: category.description })
    setFormErrors({})
    setFormError('')
  }

  const closeModal = () => setEditing(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const parsed = categoryFormSchema.safeParse(form)
    if (!parsed.success) {
      setFormErrors(zodFieldErrors(parsed.error))
      return
    }
    setFormErrors({})
    setSaving(true)

    try {
      if (editing === 'new') {
        await createCategory(parsed.data)
        setNotice(`Kategori "${parsed.data.name}" berhasil dibuat.`)
      } else if (editing) {
        await updateCategory(editing.id, parsed.data)
        setNotice(`Kategori "${parsed.data.name}" berhasil diperbarui.`)
      }
      closeModal()
      load()
    } catch (err) {
      setFormErrors(apiFieldErrors(err))
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
      await deleteCategory(deleting.id)
      setNotice(`Kategori "${deleting.name}" berhasil dihapus.`)
      setDeleting(null)
      load()
    } catch (err) {
      // Kasus paling sering: 409 karena kategori masih dipakai produk.
      // Modal dibiarkan terbuka supaya pesannya terbaca.
      setDeleteError(errorMessage(err))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
          <p className="mt-1 text-sm text-gray-600">
            Slug dibuat otomatis dari nama kategori.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + Tambah Kategori
        </button>
      </div>

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

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : categories.length === 0 ? (
          <EmptyState title="Belum ada kategori" description="Tambahkan kategori pertama." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Deskripsi</th>
                  <th className="px-5 py-3">Dibuat</th>
                  <th className="px-5 py-3 text-end">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">{category.name}</td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {category.slug || '—'}
                      </code>
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-gray-600">
                      {category.description || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(category.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleting(category)
                            setDeleteError('')
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Tambah Kategori' : 'Ubah Kategori'}
        onClose={closeModal}
      >
        <form id="category-form" className="flex flex-col gap-4" onSubmit={handleSave} noValidate>
          {formError && <Alert tone="error">{formError}</Alert>}

          <TextField
            label="Nama Kategori"
            name="name"
            value={form.name}
            error={formErrors.name}
            hint="Minimal 3 karakter"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextAreaField
            label="Deskripsi"
            name="description"
            rows={3}
            value={form.description}
            error={formErrors.description}
            hint="Opsional"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={closeModal}
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
        title="Hapus Kategori"
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
          Hapus kategori <span className="font-semibold text-gray-900">{deleting?.name}</span>?
          Kategori yang masih dipakai produk tidak bisa dihapus.
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
