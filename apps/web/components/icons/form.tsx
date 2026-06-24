/* Icones du flux d'authentification (inline, stroke-based ~1.9, rounded). */

type IconProps = { className?: string };

const baseIcon = (className = "size-4.5") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const MailIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const UserIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const EyeIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.1-.8" />
    <path d="m9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </svg>
);

export const CheckIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);
