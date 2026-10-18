'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { NavItem } from './shell';

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible" aria-label="Verwaltung">
      {items.map((it) => {
        const isRoot = it.href === '/admin' || it.href === '/team';
        const active = isRoot ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition lg:rounded-xl',
              active ? 'bg-gold/15 font-semibold text-gold-light' : 'text-cream/80 hover:bg-white/[0.04] hover:text-cream'
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
