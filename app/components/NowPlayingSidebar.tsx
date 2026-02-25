'use client';

import { Disc3, Home, Play, Compass, Library, Heart, Search } from 'lucide-react';
import { usePlaylist } from '../contexts/PlaylistContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export default function NowPlayingSidebar() {
  const { playlists } = usePlaylist();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Home', icon: <Home style={{ width: '18px', height: '18px' }} />, href: '/' },
    { label: 'Now Playing', icon: <Play style={{ width: '18px', height: '18px', fill: 'currentColor' }} />, href: '/now-playing' },
    { label: 'Discover', icon: <Compass style={{ width: '18px', height: '18px' }} />, href: '/' },
    { label: 'Library', icon: <Library style={{ width: '18px', height: '18px' }} />, href: '/' },
    { label: 'Favorites', icon: <Heart style={{ width: '18px', height: '18px' }} />, href: '/' },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0"
      data-testid="now-playing-sidebar"
      style={{
        width: '280px',
        height: '100vh',
        background: '#FFFFFF66',
        backdropFilter: 'blur(12px)',
        padding: '32px 24px',
        gap: '32px',
        borderRight: '1px solid var(--border-glass)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div className="flex items-center" style={{ gap: '10px' }}>
        <Disc3
          style={{ width: '28px', height: '28px', color: 'var(--accent-pink)' }}
          className="animate-[spin_4s_linear_infinite]"
        />
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Mizuki Prism
        </span>
      </div>

      {/* Search */}
      <div
        className="flex items-center"
        style={{
          background: '#FFFFFF80',
          borderRadius: '12px',
          padding: '10px 14px',
          gap: '8px',
          border: '1px solid var(--border-glass)',
        }}
      >
        <Search style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', color: '#94A3B8' }}>Search...</span>
      </div>

      {/* DISCOVER nav section */}
      <div>
        <h4
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#94A3B8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Discover
        </h4>
        <nav className="flex flex-col" style={{ gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href && item.label === 'Now Playing';
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center transition-all"
                style={{
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'white' : '#64748B',
                  background: isActive
                    ? 'linear-gradient(90deg, var(--accent-pink-light), var(--accent-blue-light))'
                    : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* PLAYLISTS section */}
      {playlists.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Playlists
          </h4>
          <div className="flex flex-col" style={{ gap: '4px' }}>
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="truncate"
                style={{
                  padding: '8px 14px',
                  fontSize: '14px',
                  color: '#64748B',
                  borderRadius: '8px',
                }}
              >
                {pl.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
