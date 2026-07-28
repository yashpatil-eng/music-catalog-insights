'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: '/search', label: 'Search' },
  { href: '/library', label: 'Library' },
  { href: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const { isAuthenticated, email, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={isAuthenticated ? '/search' : '/login'} className="text-lg font-semibold tracking-tight">
          🎵 Music Catalog <span className="text-accent">Insights</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated &&
            links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

          {isAuthenticated ? (
            <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-3">
              <span className="hidden text-sm text-slate-400 sm:inline">{email}</span>
              <button onClick={logout} className="btn-secondary text-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className="btn-secondary text-sm">
                Log in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
