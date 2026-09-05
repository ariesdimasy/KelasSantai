import { type SubmitEvent, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/common/Field';
import { ApiError, api } from '@/lib/api';
import { categorySchema, fieldErrors } from '@/lib/schemas';
import { formatDate, slugify } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface CategoryManagerProps {
  initialCategories: Category[];
  warning?: string;
}

export function CategoryManager({ initialCategories, warning }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(needle) ||
        category.slug.toLowerCase().includes(needle),
    );
  }, [categories, keyword]);

  async function refresh() {
    try {
      const result = await api.categories.list(true);
      setCategories(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat kategori');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.categories.remove(deleteTarget.id);
      toast.success(`Kategori "${deleteTarget.name}" dihapus`);
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus kategori');
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
            placeholder="Cari kategori…"
            aria-label="Cari kategori"
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus /> Kategori baru
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Produk</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Belum ada kategori.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">{category.productCount ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={category.source === 'fiber' ? 'secondary' : 'outline'}>
                        {category.source === 'fiber' ? 'fiber-api' : 'lokal'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {formatDate(category.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => {
                            setEditing(category);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus ${category.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(category)}
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

      <CategoryFormDialog
        key={editing?.id ?? 'new'}
        open={dialogOpen}
        category={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” akan dihapus. Kategori yang masih dipakai produk tidak bisa
              dihapus.
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

interface CategoryFormDialogProps {
  open: boolean;
  category: Category | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
}

function CategoryFormDialog({ open, category, onOpenChange, onSaved }: CategoryFormDialogProps) {
  const isEdit = category !== null;
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Slug mengikuti nama sampai admin mengubahnya sendiri.
  const effectiveSlug = slugTouched ? slug : slugify(name);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const parsed = categorySchema.safeParse({
      name,
      slug: effectiveSlug,
      description: String(form.get('description') ?? ''),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.categories.update(category.id, parsed.data);
      } else {
        await api.categories.create(parsed.data);
      }
      toast.success(isEdit ? 'Kategori diperbarui' : 'Kategori berhasil dibuat');
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        toast.error(error.message);
      } else {
        toast.error('Gagal menyimpan kategori');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit kategori #${category.id}` : 'Kategori baru'}</DialogTitle>
          <DialogDescription>
            Slug dipakai pada URL dan harus unik antar kategori.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="name" label="Nama kategori" error={errors.name} required>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
          </Field>

          <Field id="slug" label="Slug" error={errors.slug} hint="Otomatis dari nama, boleh diubah">
            <Input
              id="slug"
              value={effectiveSlug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
            />
          </Field>

          <Field id="description" label="Deskripsi" error={errors.description}>
            <Textarea id="description" name="description" rows={3} defaultValue={category?.description} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? 'Menyimpan…' : 'Simpan kategori'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
