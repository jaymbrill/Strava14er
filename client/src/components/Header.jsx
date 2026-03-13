import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ColoradoFlagLogo from './ColoradoFlagLogo';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-co-peak/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <ColoradoFlagLogo className="w-14 h-[37px]" />
            <div>
              <div className="font-display text-lg font-bold text-co-gold leading-none">Colorado</div>
              <div className="text-xs text-white/60 uppercase tracking-widest">Summit Log</div>
            </div>
          </Link>

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
                <img
                  src={user.profile_medium}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-co-gold/50"
                />
              )}
              <a
                href="mailto:jay.m.brill@gmail.com"
                className="text-xs text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 flex items-center gap-1.5"
                title="Send feedback"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Feedback
              </a>
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

