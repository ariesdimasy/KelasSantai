import { type SubmitEvent, useMemo, useRef, useState } from 'react';
import {
  ImageIcon,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/common/Field';
import { ApiError, api } from '@/lib/api';
import { fieldErrors, productSchema } from '@/lib/schemas';
import { formatDate, formatIDR } from '@/lib/utils';
import type { Category, Product } from '@/lib/types';

interface ProductManagerProps {
  initialProducts: Product[];
  categories: Category[];
  warning?: string;
}

const ALL = 'all';

export function ProductManager({ initialProducts, categories, warning }: ProductManagerProps) {
  const [products, setProducts] = useState(initialProducts);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryFilter !== ALL && String(product.categoryId) !== categoryFilter) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.category?.name.toLowerCase().includes(needle)
      );
    });
  }, [products, keyword, categoryFilter]);

  async function refresh(silent = false) {
    setRefreshing(true);
    try {
      const result = await api.products.list({ limit: 100 });
      setProducts(result.data);
      if (!silent) toast.success('Data produk dimuat ulang');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat produk');
    } finally {
      setRefreshing(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.products.remove(deleteTarget.id);
      toast.success(`Produk "${deleteTarget.name}" dihapus`);
      setDeleteTarget(null);
      await refresh(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus produk');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {warning && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {warning}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Cari produk…"
            aria-label="Cari produk"
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-52" aria-label="Filter kategori">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Semua kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => refresh()} disabled={refreshing}>
          {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Muat ulang
        </Button>

        <Button onClick={openCreate}>
          <Plus /> Produk baru
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    Belum ada produk yang cocok. Klik “Produk baru” untuk menambah.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="size-10 overflow-hidden rounded-md bg-muted">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="grid size-full place-items-center text-muted-foreground">
                            <ImageIcon className="size-4" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <a
                          href={`/products/${product.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {product.name}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          #{product.id} · {product.source === 'local' ? 'lokal (BFF)' : 'fiber-api'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">{product.category?.name ?? '-'}</Badge>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      {formatIDR(product.price)}
                    </TableCell>

                    <TableCell className="text-right">{product.stock}</TableCell>

                    <TableCell>
                      {product.isActive ? (
                        <Badge variant="success">aktif</Badge>
                      ) : (
                        <Badge variant="outline">nonaktif</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${product.name}`}
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus ${product.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProductFormDialog
        key={editing?.id ?? 'new'}
        open={dialogOpen}
        product={editing}
        categories={categories}
        onOpenChange={setDialogOpen}
        onSaved={() => refresh(true)}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk “{deleteTarget?.name}” akan dihapus beserta image-nya. Tindakan ini tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {deleting ? 'Menghapus…' : 'Ya, hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- form tambah / edit produk ---------------------------------------------

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
}

function ProductFormDialog({
  open,
  product,
  categories,
  onOpenChange,
  onSaved,
}: ProductFormDialogProps) {
  const isEdit = product !== null;
  const fileInput = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState(
    product ? String(product.categoryId) : (categories[0] ? String(categories[0].id) : ''),
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function pickImage(file: File | null) {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (product?.imageUrl ?? null));
  }

  async function handleRemoveImage() {
    if (!product?.image) {
      pickImage(null);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }

    try {
      await api.products.deleteImage(product.id);
      setImagePreview(null);
      setImageFile(null);
      toast.success('Image produk dihapus');
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus image');
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const parsed = productSchema.safeParse({
      name: String(form.get('name') ?? ''),
      description: String(form.get('description') ?? ''),
      price: String(form.get('price') ?? ''),
      stock: String(form.get('stock') ?? ''),
      categoryId,
      isActive,
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const saved = isEdit
        ? await api.products.update(product.id, parsed.data)
        : await api.products.create(parsed.data);

      // Image diunggah SETELAH produk tersimpan, karena endpoint image
      // butuh id produk (POST /api/products/:id/image).
      if (imageFile) {
        try {
          await api.products.uploadImage(saved.data.id, imageFile);
        } catch (uploadError) {
          toast.error(
            uploadError instanceof Error
              ? `Produk tersimpan, tapi image gagal: ${uploadError.message}`
              : 'Produk tersimpan, tapi image gagal diunggah',
          );
        }
      }

      toast.success(isEdit ? 'Produk diperbarui' : 'Produk berhasil dibuat');
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        toast.error(error.message);
      } else {
        toast.error('Gagal menyimpan produk');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit produk #${product.id}` : 'Produk baru'}</DialogTitle>
          <DialogDescription>
            Satu produk hanya boleh punya satu image (maksimal 2 MB, jpg/png/webp).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Nama produk" error={errors.name} required>
              <Input id="name" name="name" defaultValue={product?.name} />
            </Field>

            <Field id="category" label="Kategori" error={errors.categoryId} required>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="price" label="Harga (Rp)" error={errors.price} required>
              <Input
                id="price"
                name="price"
                type="number"
                min={1}
                defaultValue={product?.price ?? ''}
                placeholder="150000"
              />
            </Field>

            <Field id="stock" label="Stok" error={errors.stock} required>
              <Input
                id="stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 0}
              />
            </Field>
          </div>

          <Field
            id="description"
            label="Deskripsi"
            error={errors.description}
            hint="Minimal 10 karakter — dipakai juga untuk meta description SEO"
            required
          >
            <Textarea id="description" name="description" rows={4} defaultValue={product?.description} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="size-24 overflow-hidden rounded-lg border bg-muted">
              {imagePreview ? (
                <img src={imagePreview} alt="Pratinjau image" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground">
                  <ImageIcon className="size-6" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image produk</Label>
              <Input
                ref={fileInput}
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
              />
              {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                >
                  <ImagePlus /> Pilih file
                </Button>

                {(imagePreview || product?.image) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => void handleRemoveImage()}
                  >
                    <X /> Hapus image
                  </Button>
                )}
              </div>
            </div>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            Tampilkan produk di storefront
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting || !categoryId}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? 'Menyimpan…' : 'Simpan produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
