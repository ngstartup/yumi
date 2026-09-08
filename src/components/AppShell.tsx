import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { feedback } from '@/lib/feedback';
import { useT } from '@/i18n';
import { useApp } from '@/state/store';
import { IconChart, IconCloudOff, IconHome, IconLearn, IconPath, IconUser } from '@/ds/icons';
import { Fox } from '@/mascot';
import { LEVEL_TO_STAGE } from '@/mascot/expressions';

const TABS = [
  { to: '/app', end: true, key: 'home', Icon: IconHome },
  { to: '/app/learn', end: false, key: 'learn', Icon: IconLearn },
  { to: '/app/review', end: false, key: 'review', Icon: IconPath },
  { to: '/app/progress', end: false, key: 'progress', Icon: IconChart },
  { to: '/app/profile', end: false, key: 'profile', Icon: IconUser },
] as const;

export function AppShell() {
  const t = useT();
  const location = useLocation();
  const profile = useApp((s) => s.profile);
  const online = useApp((s) => s.online);
  const streak = useApp((s) => s.streak.current);
  const daily = useApp((s) => s.daily);

  const stage = LEVEL_TO_STAGE[profile?.level ?? 'A1'] ?? 1;

  return (
    <div className="min-h-screen bg-surface-alt pt-[var(--safe-top)] pb-[calc(4.75rem+var(--safe-bottom))] sm:pt-0 sm:pb-0">
      <a href="#main" className="yumi-skip-link">
        Aller au contenu
      </a>

      {/* Barre supérieure — desktop */}
      <header className="sticky top-0 z-40 hidden border-b border-surface-sunk bg-white sm:block">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-6">
          <NavLink to="/app" className="flex items-center gap-2" aria-label="Yumi — accueil">
            <Fox size={34} stage={stage} expression="happy" />
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">Yumi</span>
          </NavLink>
          <nav className="flex flex-1 items-center gap-1" aria-label="Navigation principale">
            {TABS.map(({ to, end, key, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => feedback('navigate')}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-ink-muted hover:bg-surface-sunk hover:text-ink'
                  )
                }
              >
                <Icon />
                {t(`nav.${key}`)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-sun-50 px-3 py-1.5 text-sun-800" title="Série">
              🔥 {streak}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700" title="XP du jour">
              ⚡ {daily?.xp ?? 0}
            </span>
          </div>
        </div>
      </header>

      {!online && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-xs font-medium text-white"
        >
          <IconCloudOff width={14} height={14} />
          {t('offline.banner')}
        </div>
      )}

      <main id="main" key={location.pathname} className="mx-auto max-w-5xl animate-riseIn px-4 py-5 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      {/* Barre inférieure — mobile */}
      <nav
        aria-label="Navigation principale"
        data-bottom-nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-sunk bg-white pb-[var(--safe-bottom)] sm:hidden"
      >
        <div className="flex">
          {TABS.map(({ to, end, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => feedback('navigate')}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-blue-600' : 'text-ink-muted'
                )
              }
            >
              <Icon width={22} height={22} />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
