import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FieldProps {
  /** harus sama dengan id input di dalamnya, supaya label bisa diklik */
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Pembungkus satu baris form: label + input + pesan error.
 * Pesan error memakai role="alert" agar dibacakan screen reader saat muncul.
 */
export function Field({
  id,
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      {children}

      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
