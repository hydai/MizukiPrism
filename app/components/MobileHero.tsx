'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface MobileHeroProps {
  name: string;
  description: string;
  avatarUrl: string;
  songCount: number;
}

export default function MobileHero({ name, description, avatarUrl, songCount }: MobileHeroProps) {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header
      data-testid="mobile-hero"
      className="lg:hidden flex flex-col items-center flex-shrink-0"
      style={{
        padding: '16px 24px 24px 24px',
        borderBottom: '1px solid var(--border-glass)',
        gap: '12px',
      }}
    >
      <div
        className="flex-shrink-0"
        style={{
          width: '160px',
          height: '160px',
          borderRadius: 'var(--radius-xl)',
          padding: '3px',
          background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
          boxShadow: '0 8px 32px rgba(244, 114, 182, 0.25)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {avatarError ? (
            <div
              role="img"
              aria-label={name}
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--accent-pink-light), var(--accent-blue-light))',
              }}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element -- Keep the existing external avatar fallback behavior. */
            <img
              src={avatarUrl}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setAvatarError(true)}
            />
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-1.5"
        style={{
          background: 'var(--bg-accent-pink)',
          borderRadius: 'var(--radius-pill)',
          padding: '4px 12px 4px 8px',
          color: 'var(--accent-pink)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        <Sparkles style={{ width: '12px', height: '12px' }} />
        Verified Artist
      </div>

      <h1
        style={{
          fontSize: '36px',
          fontWeight: 900,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          textAlign: 'center',
          margin: 0,
        }}
      >
        {name}
      </h1>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {description}
        {' '}
        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
        {' '}
        <span style={{ fontWeight: 600 }}>{songCount} 首歌曲</span>
      </p>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        21.8萬位訂閱者
        {' '}
        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
        {' '}
        Rank{' '}
        <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>#1</span>
      </p>
    </header>
  );
}
