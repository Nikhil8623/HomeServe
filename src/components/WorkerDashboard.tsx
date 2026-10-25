import { useState } from 'react';
import type { AuthUser } from '@/App';
import {
  BadgeCheck, Bell, CalendarDays, Check, ChevronRight, Clock, Home,
  Images, IndianRupee, LogOut, Menu, Settings, Star, User, Wrench, X,
} from 'lucide-react';
import WorkerSpace from '@/components/WorkerSpace';
import type { WorkerTab } from '@/lib/worker';

type Props = {
  user: AuthUser;
  onSignOut: () => void;
};

type WorkerNavLabel = 'Overview' | 'My Profile' | 'My Services' | 'My Bookings' | 'Availability' | 'Portfolio' | 'Reviews' | 'Earnings' | 'Settings';

const navItems: Array<{ label: WorkerNavLabel; tab: WorkerTab | null; icon: typeof Home }> = [
  { label: 'Overview', tab: 'overview', icon: Home },
  { label: 'My Profile', tab: 'profile', icon: User },
  { label: 'My Services', tab: 'services', icon: Wrench },
  { label: 'My Bookings', tab: 'bookings', icon: CalendarDays },
  { label: 'Availability', tab: 'availability', icon: Clock },
  { label: 'Portfolio', tab: 'portfolio', icon: Images },
  { label: 'Reviews', tab: 'reviews', icon: Star },
  { label: 'Earnings', tab: null, icon: IndianRupee },
  { label: 'Settings', tab: null, icon: Settings },
];

export default function WorkerDashboard({ user, onSignOut }: Props) {
  const [active, setActive] = useState<WorkerNavLabel>('Overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const displayName = user.fullName || user.name || 'Worker';
  const avatarText = displayName.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();
  // WorkerSpace requires a string ID. Fall back to email if the API omits an ID.
  const userId = String(user.id ?? user.email);
  const userEmail = user.email ?? '';

  const workerTab: WorkerTab | null = navItems.find((n) => n.label === active)?.tab ?? null;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const handleNavClick = (label: WorkerNavLabel) => {
    setActive(label);
    setMenuOpen(false);
    if (label === 'Earnings') {
      showNotice('Earnings details are coming soon.');
    } else if (label === 'Settings') {
      showNotice('Settings will be available soon.');
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Home size={19} strokeWidth={2.5} /></div>
          <span>HomeServe <span className="sidebar-role-tag">Worker</span></span>
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="worker-sidebar-profile">
          <span className="worker-sidebar-avatar">{avatarText}</span>
          <div>
            <strong>{displayName}</strong>
            <span><BadgeCheck size={12} /> Worker Account</span>
          </div>
        </div>
        <nav className="main-nav" aria-label="Worker navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? 'active' : ''}`}
              onClick={() => handleNavClick(label)}
            >
              <Icon size={20} strokeWidth={active === label ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => void onSignOut()}><LogOut size={20} /><span>Logout</span></button>
          <div className="help-card"><span>Need help with your worker account?</span><button onClick={() => showNotice('Our worker support team will be in touch shortly.')}>Get support <ChevronRight size={14} /></button></div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <span className="topbar-title">Worker Space</span>
          <div className="topbar-actions">
            <button className="icon-button" onClick={() => showNotice('You are all caught up.')} aria-label="Notifications"><Bell size={21} /></button>
            <button className="avatar" onClick={() => void onSignOut()} aria-label="Sign out">{avatarText}</button>
          </div>
        </header>

        <main className="content">
          {workerTab ? (
            <WorkerSpace
              userId={userId}
              email={userEmail}
              fullName={displayName}
              activeTab={workerTab}
              onTabChange={(t) => {
                const item = navItems.find((n) => n.tab === t);
                if (item) setActive(item.label);
              }}
              hideInternalTabs
            />
          ) : (
            <div className="worker-placeholder">
              {active === 'Earnings' && <EarningsPlaceholder />}
              {active === 'Settings' && <SettingsPlaceholder onSignOut={onSignOut} />}
            </div>
          )}
        </main>
      </div>
      {notice && <div className="toast"><Check size={17} />{notice}</div>}
    </div>
  );
}

function EarningsPlaceholder() {
  return (
    <div className="findpros-empty">
      <IndianRupee size={32} />
      <h3>Earnings Overview</h3>
      <p>Detailed earnings reports and payment history will be available here once payment integration is enabled.</p>
    </div>
  );
}

function SettingsPlaceholder({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="worker-settings-page">
      <h2>Settings</h2>
      <div className="worker-settings-list">
        <div className="worker-settings-card">
          <h3>Account</h3>
          <p>Manage your worker account preferences.</p>
          <button className="outline-button" onClick={() => void onSignOut()}><LogOut size={16} /> Sign Out</button>
        </div>
      </div>
    </div>
  );
}
