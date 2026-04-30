import type { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  label: string;
  className?: string;
};

export function FormField({ children, error, label, className }: FormFieldProps) {
  return (
    <label className={className}>
      {label}
      {children}
      {error ? <p className="field-error">{error}</p> : null}
    </label>
  );
}
