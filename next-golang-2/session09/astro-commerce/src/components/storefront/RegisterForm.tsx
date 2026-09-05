import { type SubmitEvent, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/common/Field';
import { ApiError, api } from '@/lib/api';
import { fieldErrors, registerSchema } from '@/lib/schemas';

interface RegisterFormProps {
  redirectTo?: string;
}

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const parsed = registerSchema.safeParse({
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      confirmPassword: String(form.get('confirmPassword') ?? ''),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const result = await api.auth.register(parsed.data);
      toast.success(`Akun ${result.data.user.email} berhasil dibuat`);
      window.location.href = redirectTo || '/home';
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        toast.error(error.message);
      } else {
        toast.error('Registrasi gagal, coba lagi');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="name" label="Nama lengkap" error={errors.name} required>
        <Input id="name" name="name" autoComplete="name" placeholder="Nama Anda" />
      </Field>

      <Field id="email" label="Email" error={errors.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" />
      </Field>

      <Field
        id="password"
        label="Password"
        error={errors.password}
        hint="Minimal 6 karakter"
        required
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </Field>

      <Field id="confirmPassword" label="Ulangi password" error={errors.confirmPassword} required>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
        />
      </Field>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {submitting ? 'Mendaftar…' : 'Buat akun'}
      </Button>

      <p className="text-xs text-muted-foreground">
        Akun baru otomatis berperan sebagai <strong>user</strong> (pembeli). Role admin hanya bisa
        diberikan dari halaman manajemen user di dashboard.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <a href="/signin" className="font-medium text-primary hover:underline">
          Masuk di sini
        </a>
      </p>
    </form>
  );
}
