import type { LucideIcon } from 'lucide-react';

interface M3IconProps {
  icon: LucideIcon;
  label: string;
}

export function M3Icon({ icon: Icon, label }: M3IconProps) {
  return (
    <span className="m3-icon" aria-label={label} role="img">
      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
