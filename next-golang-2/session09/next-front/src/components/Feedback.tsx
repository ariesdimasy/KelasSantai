import { cn } from '../helper/format'

type AlertProps = {
  tone?: 'error' | 'success' | 'info'
  children: React.ReactNode
  className?: string
}

const tones = {
  error: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-teal-50 text-teal-800 border-teal-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
}

export function Alert({ tone = 'info', children, className }: AlertProps) {
  return (
    <div
      // assertive untuk error supaya langsung dibacakan screen reader
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-4 py-3 text-sm', tones[tone], className)}
    >
      {children}
    </div>
  )
}

export function Spinner({ label = 'Memuat…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
      <span
        className="inline-block size-5 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600"
        aria-hidden="true"
      />
      <span role="status">{label}</span>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-14 text-center">
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  )
}
