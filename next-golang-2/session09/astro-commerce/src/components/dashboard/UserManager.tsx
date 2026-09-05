import { type SubmitEvent, useMemo, useState } from 'react';
import { KeyRound, Loader2, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Field } from '@/components/common/Field';
import { ApiError, api } from '@/lib/api';
import { fieldErrors, userCreateSchema, userUpdateSchema } from '@/lib/schemas';
import { formatDate } from '@/lib/utils';
import type { Role, SessionUser, User } from '@/lib/types';

interface UserManagerProps {
  initialUsers: User[];
  /** admin yang sedang login — dipakai untuk mencegah hapus akun sendiri */
  currentUser: SessionUser;
}

export function UserManager({ initialUsers, currentUser }: UserManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [keyword, setKeyword] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle),
    );
  }, [users, keyword]);

  async function refresh() {
    try {
      const result = await api.users.list();
      setUsers(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat user');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.users.remove(deleteTarget.id);
      toast.success(`User "${deleteTarget.email}" dihapus`);
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus user');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Cari nama atau email…"
            aria-label="Cari user"
            className="pl-9"
          />
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus /> User baru
        </Button>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Diperbarui</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Tidak ada user yang cocok.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {user.id === currentUser.id && (
                        <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' && <ShieldCheck />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {formatDate(user.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${user.name}`}
                          onClick={() => {
                            setEditing(user);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Hapus ${user.name}`}
                          className="text-destructive hover:text-destructive"
                          disabled={user.id === currentUser.id}
                          title={
                            user.id === currentUser.id ? 'Tidak bisa menghapus akun sendiri' : undefined
                          }
                          onClick={() => setDeleteTarget(user)}
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

      <UserFormDialog
        key={editing?.id ?? 'new'}
        open={dialogOpen}
        user={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus user?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun “{deleteTarget?.email}” akan dihapus permanen.
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

interface UserFormDialogProps {
  open: boolean;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
}

function UserFormDialog({ open, user, onOpenChange, onSaved }: UserFormDialogProps) {
  const isEdit = user !== null;
  const [role, setRole] = useState<Role>(user?.role ?? 'user');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      role,
    };

    // Saat edit, password boleh kosong (artinya tidak diganti).
    const parsed = isEdit
      ? userUpdateSchema.safeParse(payload)
      : userCreateSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.users.update(user.id, parsed.data);
      } else {
        await api.users.create(parsed.data as typeof payload);
      }
      toast.success(isEdit ? 'User diperbarui' : 'User berhasil dibuat');
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        toast.error(error.message);
      } else {
        toast.error('Gagal menyimpan user');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit user #${user.id}` : 'User baru'}</DialogTitle>
          <DialogDescription>
            Password disimpan sebagai hash scrypt, bukan teks asli.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="name" label="Nama lengkap" error={errors.name} required>
            <Input id="name" name="name" defaultValue={user?.name} />
          </Field>

          <Field id="email" label="Email" error={errors.email} required>
            <Input id="email" name="email" type="email" defaultValue={user?.email} />
          </Field>

          <Field
            id="password"
            label={isEdit ? 'Password baru' : 'Password'}
            error={errors.password}
            hint={isEdit ? 'Kosongkan bila tidak diganti' : 'Minimal 6 karakter'}
            required={!isEdit}
          >
            <div className="relative">
              <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" className="pl-9" autoComplete="new-password" />
            </div>
          </Field>

          <Field id="role" label="Role" error={errors.role} required>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user — belanja di storefront</SelectItem>
                <SelectItem value="admin">admin — akses dashboard</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? 'Menyimpan…' : 'Simpan user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
