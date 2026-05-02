'use client';

import ThemeToggle from './ThemeToggle';

interface MobileTopBarProps {
  name: string;
}

export default function MobileTopBar({ name }: MobileTopBarProps) {
  return (
    <div
      data-testid="mobile-topbar"
      className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        height: '56px',
        padding: 'var(--safe-area-top) 20px 0 20px',
        background: 'var(--bg-surface-frosted)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-glass)',
      }}
    >
      <div style={{ width: 32 }} />
      <a
        href="https://prism.oshi.tw"
        style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none' }}
      >
        {name}
      </a>
      <ThemeToggle />
    </div>
  );
}
