import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'danger' | 'icon';
type Size = 'default' | 'lg' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-[transform,box-shadow,background,border-color,opacity] duration-200 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ' +
  'disabled:pointer-events-none disabled:opacity-55 select-none active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-gold-light to-gold text-ink font-semibold ' +
    'shadow-[0_10px_30px_-8px_rgba(212,166,58,0.6)] ' +
    'hover:shadow-[0_14px_40px_-8px_rgba(212,166,58,0.75)] hover:brightness-[1.04]',
  ghost:
    'border border-gold/30 bg-white/[0.02] text-cream backdrop-blur-sm ' +
    'hover:border-gold/60 hover:bg-gold/[0.08]',
  danger:
    'border border-danger/45 bg-danger/[0.08] text-danger ' +
    'hover:bg-danger/15 hover:border-danger/70',
  icon:
    'border border-gold/30 bg-white/[0.03] text-cream hover:border-gold/60 hover:bg-gold/[0.1]',
};

const sizes: Record<Size, string> = {
  // 44px+ Touch-Fläche
  default: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-[0.95rem] tracking-wide',
  icon: 'h-12 w-12 min-h-11 min-w-11 p-0',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
