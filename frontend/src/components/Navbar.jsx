import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

const links = [
  { href: '/search', label: 'Search' },
  { href: '/library', label: 'Library' },
  { href: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const { isAuthenticated, email, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b border-white/10 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to={isAuthenticated ? '/search' : '/login'} className="text-lg font-semibold tracking-tight">
          🎵 Music Catalog <span className="text-accent">Insights</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated &&
            links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === link.href
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

          {isAuthenticated ? (
            <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-3">
              <span className="hidden text-sm text-slate-400 sm:inline">Hi, {email}</span>
              <button onClick={logout} className="btn-secondary text-sm">
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                to="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === '/'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/login"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === '/login'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  location.pathname === '/register'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
