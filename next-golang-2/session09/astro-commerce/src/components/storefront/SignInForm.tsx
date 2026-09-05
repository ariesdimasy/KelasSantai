import { type SubmitEvent, useState } from 'react';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/common/Field';
import { ApiError, api } from '@/lib/api';
import { fieldErrors, signInSchema } from '@/lib/schemas';

interface SignInFormProps {
  /** halaman tujuan setelah login (dari ?redirect=) */
  redirectTo?: string;
}

/** Akun bawaan hasil seed store lokal — memudahkan demo di kelas. */
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@astro.dev', password: 'admin123' },
  { label: 'Pelanggan', email: 'user@astro.dev', password: 'user123' },
];

export function SignInForm({ redirectTo }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const result = await api.auth.signIn(parsed.data);
      const user = result.data.user;

      // Admin ke dashboard, user ke storefront — kecuali ada ?redirect=
      const target = redirectTo || (user.role === 'admin' ? '/dashboard' : '/home');
      toast.success(`Selamat datang, ${user.name}`);
      window.location.href = target;
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError) {
        setErrors(error.errors ?? {});
        toast.error(error.message);
      } else {
        toast.error('Login gagal, coba lagi');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="email" label="Email" error={errors.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
      </Field>

      <Field id="password" label="Password" error={errors.password} required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <LogIn />}
        {submitting ? 'Memproses…' : 'Masuk'}
      </Button>

      <div className="rounded-lg border border-dashed p-3">
        <p className="mb-2 text-xs text-muted-foreground">Akun demo (klik untuk mengisi form):</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.email}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
            >
              {account.label}: {account.email}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <a href="/register" className="font-medium text-primary hover:underline">
          Daftar sekarang
        </a>
      </p>
    </form>
  );
}
