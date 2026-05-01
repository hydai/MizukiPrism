'use client';

import { useState } from 'react';
import { Facebook, Instagram, Twitch, Twitter, Youtube } from 'lucide-react';

interface DesktopHeroProps {
  name: string;
  description: string;
  avatarUrl: string;
  songCount: number;
  socialLinks: {
    youtube: string;
    twitter: string;
    facebook: string;
    instagram: string;
    twitch: string;
  };
}

export default function DesktopHero({
  name,
  description,
  avatarUrl,
  songCount,
  socialLinks,
}: DesktopHeroProps) {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header
      data-testid="desktop-hero"
      className="relative hidden lg:flex items-center gap-8 overflow-hidden flex-shrink-0"
      style={{
        minHeight: '280px',
        padding: '40px 40px 0 40px',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      {/* Left: Avatar */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{
          width: '180px',
          height: '180px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          alignSelf: 'flex-end',
          marginBottom: '40px',
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
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        )}
      </div>

      {/* Right: Info Stack */}
      <div
        className="flex flex-col justify-end flex-1 min-w-0"
        style={{
          paddingBottom: '40px',
          gap: '8px',
        }}
      >
        {/* VerifiedBadge Component */}
        <div
          className="flex items-center gap-1.5 w-fit"
          style={{
            background: 'var(--bg-accent-blue-muted)',
            color: 'var(--accent-blue)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 12px 4px 8px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 0L7.545 4.455L12 6L7.545 7.545L6 12L4.455 7.545L0 6L4.455 4.455L6 0Z" fill="currentColor" />
          </svg>
          認證藝人
        </div>

        {/* Streamer Name */}
        <h1
          className="tracking-tight leading-none"
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {name}
        </h1>

        {/* Description / Stats Text */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-base)',
            maxWidth: '480px',
            lineHeight: 1.5,
            margin: '2px 0',
          }}
        >
          {description}
          {' '}
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          {' '}
          <span style={{ fontWeight: 600 }}>{songCount} 首歌曲</span>
        </p>

        {/* Statistics Row: Followers + Rank */}
        <div
          className="flex items-center gap-6"
          style={{ fontSize: 'var(--font-size-base)', marginTop: '4px' }}
        >
          <div className="flex items-center gap-1.5">
            <span
              style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-xl)' }}
            >
              21.8萬
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              訂閱者
            </span>
          </div>
          <div
            style={{
              width: '1px',
              height: '16px',
              background: 'var(--border-default)',
            }}
          />
          <div className="flex items-center gap-1.5">
            <span
              style={{ fontWeight: 700, color: 'var(--accent-pink)', fontSize: 'var(--font-size-xl)' }}
            >
              #1
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              排名
            </span>
          </div>
        </div>

        {/* Social Links Row */}
        <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
          {/* YouTube SocialButton */}
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px 6px 10px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Youtube className="w-4 h-4" style={{ color: '#FF0000' }} />
            YouTube
          </a>
          {/* Twitter SocialButton */}
          <a
            href={socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px 6px 10px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Twitter className="w-4 h-4" style={{ color: '#1DA1F2' }} />
            X
          </a>
          {/* Facebook SocialButton */}
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px 6px 10px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Facebook className="w-4 h-4" style={{ color: '#1877F2' }} />
            Facebook
          </a>
          {/* Instagram SocialButton */}
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px 6px 10px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Instagram className="w-4 h-4" style={{ color: '#E4405F' }} />
            Instagram
          </a>
          {/* Twitch SocialButton */}
          <a
            href={socialLinks.twitch}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-all hover:opacity-80"
            style={{
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-pill)',
              padding: '6px 14px 6px 10px',
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Twitch className="w-4 h-4" style={{ color: '#9146FF' }} />
            Twitch
          </a>
        </div>
      </div>

      {/* Bottom gradient overlay: surface color fading to transparent from bottom up */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '60px',
          background: 'linear-gradient(to top, var(--bg-surface-frosted) 0%, transparent 100%)',
        }}
      />
    </header>
  );
}
