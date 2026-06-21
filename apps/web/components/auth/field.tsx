import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  icon: ReactNode;
  trailing?: ReactNode;
  hint?: string;
  error?: string;
  valid?: boolean;
};

export function Field({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  autoFocus,
  icon,
  trailing,
  hint,
  error,
  valid,
}: FieldProps) {
  const borderClass = error
    ? "border-live focus-within:border-live focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
    : valid
      ? "border-green-500 focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.12)]"
      : "border-border focus-within:border-gold focus-within:shadow-[0_0_0_3px_rgba(186,117,23,0.14)]";

  const iconClass = error
    ? "text-live"
    : valid
      ? "text-green-500"
      : "text-placeholder group-focus-within:text-gold";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-brown-sec">
        {label}
      </label>
      <div
        className={`group flex h-12.5 items-center gap-2.5 rounded-field border-[1.5px] bg-cream px-3.5 transition-all duration-150 focus-within:bg-card ${borderClass}`}
      >
        <span className={`shrink-0 transition-colors ${iconClass}`}>
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-[15px] text-brown outline-none placeholder:text-placeholder"
        />
        {trailing}
      </div>
      {(error ?? hint) && (
        <p className={`mt-1 text-xs ${error ? "text-live" : "text-brown-sec"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
