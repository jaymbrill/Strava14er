import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function MountainIcon() {
  return (
    <svg viewBox="0 0 40 32" className="w-10 h-8" fill="none">
      <path d="M20 2 L38 30 L2 30 Z" fill="#FFC72C" />
      <path d="M20 2 L28 14 L20 10 L14 16 L20 2Z" fill="white" opacity="0.9" />
      <path d="M8 30 L20 10 L32 30Z" fill="#003DA5" />
      <path d="M0 30 L10 18 L18 30Z" fill="#2d4a6b" />
      <path d="M22 30 L32 16 L40 30Z" fill="#2d4a6b" />
    </svg>
  );
}

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-co-peak/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <MountainIcon />
            <div>
              <div className="font-display text-lg font-bold text-co-gold leading-none">Colorado</div>
              <div className="text-xs text-white/60 uppercase tracking-widest">14er Tracker</div>
            </div>
          </Link>

          {/* Colorado flag stripe accent */}
          <div className="hidden md:flex items-center gap-1 h-6">
            <div className="w-12 h-full bg-co-blue rounded-sm opacity-70" />
            <div className="w-2 h-full bg-co-gold rounded-sm opacity-90" />
            <div className="w-12 h-full bg-co-red rounded-sm opacity-70" />
          </div>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-white">
                  {user.firstname} {user.lastname}
                </div>
                <div className="text-xs text-white/50">{user.city}{user.city && user.state ? ', ' : ''}{user.state}</div>
              </div>
              {user.profile_medium && (
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-co-gold/30 blur-md scale-110" />
                  <img
                    src={user.profile_medium}
                    alt="Profile"
                    className="relative w-11 h-11 rounded-full border-2 border-co-gold object-cover shadow-lg shadow-co-gold/20"
                  />
                </div>
              )}
              <button
                onClick={logout}
                className="text-xs text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Colorado flag color bar */}
      <div className="flex h-0.5">
        <div className="flex-1 bg-co-blue" />
        <div className="w-8 bg-co-gold" />
        <div className="flex-1 bg-co-red" />
      </div>
    </header>
  );
}
