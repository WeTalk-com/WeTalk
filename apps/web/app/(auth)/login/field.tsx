import type { ReactNode } from "react";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon: ReactNode;
  trailing?: ReactNode;
};

/** Champ de formulaire avec icone, focus state dore et slot trailing. */
export function Field({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  trailing,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-brown-sec"
      >
        {label}
      </label>
      <div className="group flex h-[50px] items-center gap-2.5 rounded-field border-[1.5px] border-border bg-cream px-3.5 transition-all duration-150 focus-within:border-gold focus-within:bg-card focus-within:shadow-[0_0_0_3px_rgba(186,117,23,0.14)]">
        <span className="shrink-0 text-placeholder transition-colors group-focus-within:text-gold">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-[15px] text-brown outline-none placeholder:text-placeholder"
        />
        {trailing}
      </div>
    </div>
  );
}
