'use client';

import { House, ListMusic, Radio, Search, type LucideIcon } from 'lucide-react';
import type { CatalogMobileTab } from '../hooks/useCatalogViewState';

interface MobileBottomNavProps {
  activeTab: CatalogMobileTab;
  onTabChange: (tab: CatalogMobileTab) => void;
}

const navItems: Array<{
  tab: CatalogMobileTab;
  label: string;
  testId: string;
  icon: LucideIcon;
}> = [
  { tab: 'home', label: 'Home', testId: 'bottom-nav-home', icon: House },
  { tab: 'search', label: 'Search', testId: 'bottom-nav-search', icon: Search },
  { tab: 'streams', label: '歌枠', testId: 'bottom-nav-streams', icon: Radio },
  { tab: 'library', label: 'Library', testId: 'bottom-nav-library', icon: ListMusic },
];

export default function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <nav
      data-testid="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] flex items-start justify-around"
      style={{
        padding: '8px 0 calc(16px + var(--safe-area-bottom)) 0',
        background: 'var(--bg-surface-frosted)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-glass)',
      }}
    >
      {navItems.map(({ tab, label, testId, icon: Icon }) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            data-testid={testId}
            onClick={() => onTabChange(tab)}
            className="flex flex-col items-center justify-start"
            style={{ gap: '4px', flex: 1 }}
          >
            <Icon
              style={{
                width: '22px',
                height: '22px',
                color: isActive ? 'var(--accent-pink)' : 'var(--text-tertiary)',
              }}
            />
            <span
              style={{
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent-pink)' : 'var(--text-tertiary)',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
