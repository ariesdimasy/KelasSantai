import { type SubmitEvent, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/common/Field';
import { ApiError, api } from '@/lib/api';
import { fieldErrors, profileSchema } from '@/lib/schemas';
import type { SessionUser } from '@/lib/types';

interface ProfileFormProps {
  user: SessionUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const parsed = profileSchema.safeParse({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await api.auth.updateProfile(parsed.data);
      toast.success('Profil berhasil diperbarui');
      // reload supaya header & session di server ikut memakai data baru
      window.location.reload();
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        toast.error(error.message);
      } else {
        toast.error('Gagal menyimpan profil');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="name" label="Nama lengkap" error={errors.name} required>
        <Input id="name" name="name" defaultValue={user.name} autoComplete="name" />
      </Field>

      <Field id="email" label="Email" error={errors.email} required>
        <Input id="email" name="email" type="email" defaultValue={user.email} autoComplete="email" />
      </Field>

      <Field
        id="password"
        label="Password baru"
        error={errors.password}
        hint="Biarkan kosong bila tidak ingin mengganti password"
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </Field>

      <Button type="submit" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <Save />}
        {submitting ? 'Menyimpan…' : 'Simpan perubahan'}
      </Button>
    </form>
  );
}
