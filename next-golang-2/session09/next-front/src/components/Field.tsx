import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../helper/format'

const baseInput =
  'block w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none disabled:pointer-events-none disabled:opacity-50'
const okInput = 'border-gray-200 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
const badInput = 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500'

type Wrap = {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function Wrapper({ label, htmlFor, error, hint, children }: Wrap) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
      </label>
      {children}
      {/* role="alert" supaya screen reader membacakan error saat muncul */}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, id, ...rest }: TextFieldProps) {
  const fieldId = id ?? rest.name ?? label
  return (
    <Wrapper label={label} htmlFor={fieldId} error={error} hint={hint}>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(baseInput, error ? badInput : okInput)}
        {...rest}
      />
    </Wrapper>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
}

export function TextAreaField({ label, error, hint, id, ...rest }: TextAreaProps) {
  const fieldId = id ?? rest.name ?? label
  return (
    <Wrapper label={label} htmlFor={fieldId} error={error} hint={hint}>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(baseInput, error ? badInput : okInput)}
        {...rest}
      />
    </Wrapper>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
}

export function SelectField({ label, error, hint, id, children, ...rest }: SelectProps) {
  const fieldId = id ?? rest.name ?? label
  return (
    <Wrapper label={label} htmlFor={fieldId} error={error} hint={hint}>
      <select
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(baseInput, error ? badInput : okInput)}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  )
}
