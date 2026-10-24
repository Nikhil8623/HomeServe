import { useMemo, useState } from 'react';
import {
  Bell, CalendarCheck, Check, CheckCheck, Clock3, MessageCircle,
  ShieldCheck, Sparkles, Trash2, Wrench, Filter, CheckCircle2,
} from 'lucide-react';
import './notifications-page.css';

type NotificationKind = 'booking' | 'message' | 'reminder' | 'account';
type Notice = {
  id: number;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

const initialNotifications: Notice[] = [
  { id: 1, kind: 'booking', title: 'Booking request received', description: 'Your home service booking request has been received. You can review its details in Bookings.', time: 'Today · 10:30 AM', unread: true },
  { id: 2, kind: 'message', title: 'New message update', description: 'Keep an eye on your Messages page for replies from service professionals.', time: 'Today · 9:15 AM', unread: true },
  { id: 3, kind: 'reminder', title: 'Home maintenance reminder', description: 'Consider checking taps and visible pipes for leaks this week.', time: 'Yesterday', unread: false },
  { id: 4, kind: 'account', title: 'Welcome to HomeServe', description: 'Your customer account is ready. Complete your profile to keep your contact details up to date.', time: 'Recently', unread: false },
];

const kindLabels: Record<NotificationKind, string> = {
  booking: 'Bookings', message: 'Messages', reminder: 'Reminders', account: 'Account',
};

function NoticeIcon({ kind }: { kind: NotificationKind }) {
  if (kind === 'booking') return <CalendarCheck size={19} />;
  if (kind === 'message') return <MessageCircle size={19} />;
  if (kind === 'reminder') return <Wrench size={19} />;
  return <ShieldCheck size={19} />;
}

type NotificationsPageProps = { onOpenSettings?: () => void };

export default function NotificationsPage({ onOpenSettings }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notice[]>(() => {
    try {
      const stored = window.localStorage.getItem('homeserve-notifications');
      return stored ? JSON.parse(stored) as Notice[] : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = notifications.filter((item) => item.unread).length;
  const visibleNotifications = useMemo(
    () => notifications.filter((item) => filter === 'all' || item.unread),
    [notifications, filter],
  );

  function updateNotifications(next: Notice[]) {
    setNotifications(next);
    try { window.localStorage.setItem('homeserve-notifications', JSON.stringify(next)); } catch { /* Keep state usable if storage is unavailable. */ }
  }

  function markRead(id: number) {
    updateNotifications(notifications.map((item) => item.id === id ? { ...item, unread: false } : item));
  }

  function markAllRead() {
    updateNotifications(notifications.map((item) => ({ ...item, unread: false })));
  }

  function clearAll() {
    updateNotifications([]);
  }

  return (
    <section className="notifications-page">
      <div className="notifications-heading">
        <div>
          <span className="notifications-eyebrow">YOUR ACTIVITY</span>
          <h1>Notifications</h1>
          <p>Stay up to date with bookings, messages, and home care reminders.</p>
        </div>
        <div className="notifications-heading-icon"><Bell size={25} /></div>
      </div>

      <div className="notifications-summary-grid">
        <div className="notifications-summary-card">
          <span className="notifications-summary-icon"><Bell size={19} /></span>
          <div><span>All notifications</span><strong>{notifications.length}</strong></div>
        </div>
        <div className="notifications-summary-card">
          <span className="notifications-summary-icon unread-icon"><CheckCheck size={19} /></span>
          <div><span>Unread notifications</span><strong>{unreadCount}</strong></div>
        </div>
      </div>

      <div className="notifications-list-card">
        <div className="notifications-list-heading">
          <div>
            <h2>Recent activity</h2>
            <p>{unreadCount ? `You have ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}.` : 'You are all caught up.'}</p>
          </div>
          <div className="notifications-actions">
            <label className="notifications-filter">
              <Filter size={15} />
              <select value={filter} onChange={(event) => setFilter(event.target.value as 'all' | 'unread')} aria-label="Filter notifications">
                <option value="all">All</option>
                <option value="unread">Unread</option>
              </select>
            </label>
            <button type="button" className="notifications-text-button" onClick={markAllRead} disabled={!unreadCount}>
              <Check size={15} /> Mark all read
            </button>
          </div>
        </div>

        {visibleNotifications.length ? (
          <div className="notifications-list">
            {visibleNotifications.map((item) => (
              <article className={`notification-item ${item.unread ? 'notification-unread' : ''}`} key={item.id}>
                <div className={`notification-icon notification-icon-${item.kind}`}><NoticeIcon kind={item.kind} /></div>
                <div className="notification-copy">
                  <div className="notification-title-row">
                    <h3>{item.title}</h3>
                    {item.unread && <span className="notification-new-dot" aria-label="Unread" />}
                  </div>
                  <p>{item.description}</p>
                  <div className="notification-meta"><span>{kindLabels[item.kind]}</span><span className="notification-time"><Clock3 size={13} /> {item.time}</span></div>
                </div>
                <div className="notification-item-actions">
                  {item.unread && <button type="button" title="Mark as read" aria-label={`Mark ${item.title} as read`} onClick={() => markRead(item.id)}><Check size={16} /></button>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            <span><CheckCircle2 size={27} /></span>
            <h3>{filter === 'unread' ? 'No unread notifications' : 'All clear!'}</h3>
            <p>{filter === 'unread' ? 'You have read all your notifications.' : 'New updates will appear here when available.'}</p>
            {filter === 'unread' && <button type="button" onClick={() => setFilter('all')}>View all notifications</button>}
          </div>
        )}

        <div className="notifications-footer">
          <p><ShieldCheck size={16} /> Manage which updates you receive in Settings.</p>
          <div className="notifications-footer-actions">
            {notifications.length > 0 && <button type="button" className="notifications-clear-button" onClick={clearAll}><Trash2 size={15} /> Clear all</button>}
            {onOpenSettings && <button type="button" className="notifications-settings-button" onClick={onOpenSettings}><Sparkles size={15} /> Notification preferences</button>}
          </div>
        </div>
      </div>
      <p className="notifications-demo-note">These are sample in-app notifications. Live booking and message alerts can be connected to your backend later.</p>
    </section>
  );
}
