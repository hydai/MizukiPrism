import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AuthUser } from '../../../shared/types';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/songs', label: 'Songs' },
  { to: '/streams', label: 'Streams' },
  { to: '/submit/song', label: 'Submit Song' },
  { to: '/submit/stream', label: 'Submit Stream' },
];

export default function Layout({ user, children }: { user: AuthUser; children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-white">
        {/* Header */}
        <div className="border-b border-slate-700 p-4">
          <h1 className="text-lg font-bold tracking-tight">MizukiPrism</h1>
          <p className="text-sm text-slate-400">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-700 p-4">
          <p className="truncate text-sm text-slate-300">{user.email}</p>
          <p className="mt-0.5 text-xs capitalize text-slate-500">{user.role}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">{children}</main>
    </div>
  );
}
