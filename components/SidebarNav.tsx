'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/command', label: 'Command' },
  { href: '/activity', label: 'Activity' },
  { href: '/agents', label: 'Agents' },
  { href: '/tasks', label: 'Tasks' },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? 'block rounded-md px-3 py-2 text-sm font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black'
                : 'block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
