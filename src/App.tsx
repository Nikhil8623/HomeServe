
import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import AuthPage from '@/components/AuthPage';
import { supabase } from '@/lib/supabase';

import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Hammer,
  Home,
  Mail,
  MapPin,
  Menu,
  Search,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Wrench,
  X,
  Zap,
} from 'lucide-react';

type NavItem = { label: string; icon: typeof Home };
type Pro = { name: string; role: string; rating: string; price: string; image: string };

const mumbaiAreas = [
  'Panvel',
  'Vashi',
  'Nerul',
  'Airoli',
  'Thane',
  'Kopaikhairane',
  'Dombivali',
  'Kalyan',
  'Titwala',
];


const navItems: NavItem[] = [
  { label: 'Home', icon: Home },
  { label: 'Bookings', icon: CalendarDays },
  { label: 'Find Pros', icon: Search },
  { label: 'Messages', icon: Mail },
  { label: 'Profile', icon: UserRound },
];

const services = [
  { label: 'Electrical', icon: Zap },
  { label: 'Cleaning', icon: Sparkles },
  { label: 'Handyman', icon: Hammer },
  { label: 'Landscaping', icon: Wrench },
];

const pros: Pro[] = [
  { name: 'Ravi S.', role: 'Master Electrician', rating: '4.9', price: '₹399', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBvL--ztysb9JCMBVzFlvtPARHt7bkt0SFyC5b6-kjP0JjuoObITx8Ja-FHZjsS_VDsL7nOy4dlWHa3-mvCBDOY4fjNw7fUnop2plcrXHJQjVKCb_fq6eTMpfSK9YINn9djvy03vse91Hc2x8Pv_Cj0DM5Vl8Ulo2nK5NzyRJSy5Hr2CZSTmY5_IGmpbZ4oJW9HGE0DH9QomXHXqJEMFT4XbBDA9OCxUa6BsVC7-q5S54T-GPSCGcP' },
  { name: 'Priya M.', role: 'Interior Painting', rating: '5.0', price: '₹449', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG4q23EEk9Olh1z00x0KksQOFxw8kSFh1Utw3P6VSk7nHnhj694OyOefLnp0hDgZagTNO9nRQGRJySWm-qkltILnoNXRtPVHLZSpyemMZo7Qzb7YGmsAeunDjRDvrscl05l79B3vvNkXzIyKH0JS2QMgFb8VG_X5L36jR_GA0jU56XEGAEmBp1NZETq2-fcyk8yISnFD24kVugfK3O4nGIdoNBlEqRh96YHUy2GqCB0lh4g4L2TXL1' },
  { name: 'Imran K.', role: 'AC Service Specialist', rating: '4.8', price: '₹599', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpkFRZR7nxiXZyWPpU62hxmQTo_G17rdQ4mBOFo955cUzrkmIEpAHRf8DH-MVqnKDWRBYlInQq9OImLiC2EBZeh66LA_6Kbhfk8lmpKUnvpA1Q-dBpZkrfNwkYTSOZaTZv51ZuAn0v6Yf-pf1OrU1w2VYVx5Qm_UJ_3azB8d_4gUpGV2dYSzgfMc3HUC1zGDYJTN_H3g45WXdrjI-uqIZS-o0l9yovxwI2NBH3RW1zjX0x4C0Ao4kd' },
];


function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (mounted) setSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!session) return <AuthPage onComplete={() => undefined} />;

  return (
    <Dashboard
      session={session}
      onSignOut={() =>
        supabase ? supabase.auth.signOut().then(() => undefined) : Promise.resolve()
      }
    />
  );
}

function Dashboard({
  session,
  onSignOut,
}: {
  session: Session;
  onSignOut: () => Promise<void>;
}) {
  const [active, setActive] = useState('Home');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [area, setArea] = useState('Panvel');
  const [areaOpen, setAreaOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');

  const displayName = session.user.user_metadata.full_name || 'Arjun';
  const avatarText = displayName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const filteredPros = useMemo(
    () =>
      pros.filter((pro) =>
        `${pro.name} ${pro.role}`.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const filteredAreas = useMemo(
    () =>
      mumbaiAreas.filter((name) =>
        name.toLowerCase().includes(areaSearch.toLowerCase())
      ),
    [areaSearch]
  );


  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><Home size={19} strokeWidth={2.5} /></div>
          <span>HomeServe</span>
          <button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); setMenuOpen(false); }}>
              <Icon size={20} strokeWidth={active === label ? 2.5 : 1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item"><Settings size={20} /><span>Settings</span></button>
          <div className="help-card"><span>Need a hand?</span><button onClick={() => showNotice('Our support team will be in touch shortly.')}>Get support <ChevronRight size={14} /></button></div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <label className="search-box">
            <Search size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services..." aria-label="Search services" />
            {search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
          </label>
          <div className="topbar-actions">
            <div className={`location ${areaOpen ? 'location-open' : ''}`}>
              <span>Location</span>
              <button
                className="area-trigger"
                onClick={() => {
                  setAreaOpen((value) => !value);
                  setAreaSearch('');
                }}
                aria-label="Select area"
                aria-expanded={areaOpen}
              >
                <MapPin size={13} />
                <strong>{area}, Mumbai</strong>
                <ChevronRight
                  size={14}
                  className={`area-caret ${areaOpen ? 'area-caret-open' : ''}`}
                />
              </button>

              {areaOpen && (
                <div className="area-menu">
                  <label className="area-search">
                    <Search size={15} />
                    <input
                      autoFocus
                      value={areaSearch}
                      onChange={(event) => setAreaSearch(event.target.value)}
                      placeholder="Search Mumbai areas"
                      aria-label="Search Mumbai areas"
                    />
                    {areaSearch && (
                      <button
                        onClick={() => setAreaSearch('')}
                        aria-label="Clear area search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>

                  <ul role="listbox">
                    {filteredAreas.map((name) => (
                      <li key={name}>
                        <button
                          className={area === name ? 'selected' : ''}
                          onClick={() => {
                            setArea(name);
                            setAreaOpen(false);
                            setAreaSearch('');
                            showNotice(`Showing professionals in ${name}, Mumbai.`);
                          }}
                          role="option"
                          aria-selected={area === name}
                        >
                          <MapPin size={14} /> {name}
                        </button>
                      </li>
                    ))}
                    {filteredAreas.length === 0 && (
                      <li className="no-areas">No areas found</li>
                    )}
                  </ul>
                </div>
              )}

            </div>
            <button
              className="icon-button"
              onClick={() => showNotice('You are all caught up.')}
              aria-label="Notifications"
            >
              <Bell size={21} />
            </button>
            <button
              className="avatar"
              onClick={() => void onSignOut()}
              aria-label="Sign out"
            >
              {avatarText}
            </button>
          </div>
        </header>

        <main className="content">
          <section className="welcome">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h1>Good morning, {displayName}</h1>
            </div>
            <button
              className="outline-button mobile-hide"
              onClick={() => showNotice('Your home profile is up to date.')}
            >
              Manage home <ChevronRight size={16} />
            </button>
          </section>

          <p className="location-banner">
            <MapPin size={15} />
            Showing home service professionals in <strong>{area}, Mumbai</strong>
          </p>

                    <div className="dashboard-grid">
            <div className="primary-column">
              <section className="section appointment-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Your home</span>
                    <h2>Upcoming appointment</h2>
                  </div>
                </div>
                <div className="appointment-card">
                  <div className="appointment-icon">
                    <Calendar size={26} />
                  </div>
                  <div className="appointment-info">
                    <h3>Home service booking</h3>
                    <p>Book a trusted professional for your home.</p>
                  </div>
                  <button className="dark-button" onClick={() => setActive('Explore Services')}>
                    Book a service <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              <section className="section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">What do you need?</span>
                    <h2>Quick Actions</h2>
                  </div>
                </div>
                <div className="service-grid">
                  {[
                    { name: 'Electrician', icon: Zap },
                    { name: 'Plumber', icon: Wrench },
                    { name: 'Carpenter', icon: Hammer },
                    { name: 'Cleaning', icon: Sparkles },
                  ].map(({ name, icon: Icon }) => (
                    <button key={name} className="service-card" onClick={() => { setSearch(name); setActive('Explore Services'); }}>
                      <span className="service-icon"><Icon size={23} /></span>
                      {name}
                    </button>
                  ))}
                </div>
              </section>

              <section className="section recommendations">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Handpicked for you</span>
                    <h2>Recommended professionals</h2>
                  </div>
                  <button className="text-button" onClick={() => setActive('Explore Services')}>
                    View all <ChevronRight size={16} />
                  </button>
                </div>
                <div className="pro-grid">
                  {filteredPros.map((pro) => (
                    <article className="pro-card" key={pro.name}>
                      <img src={pro.image} alt={pro.name} />
                      <div className="pro-copy">
                        <h3>{pro.name}</h3>
                        <p>{pro.role}</p>
                      </div>
                      <div className="pro-footer">
                        <span className="rating"><Star size={15} fill="currentColor" /> {pro.rating}</span>
                        <span className="price">₹{pro.price}<span className="from">/visit</span></span>
                      </div>
                      <button className="small-button pro-cta" onClick={() => showNotice(`Booking request for ${pro.name}`)}>
                        Book now
                      </button>
                    </article>
                  ))}
                  {filteredPros.length === 0 && <p className="empty-state">No professionals found. Try another search.</p>}
                </div>
              </section>
            </div>

            <aside className="right-column">
              <section className="section recent-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Your activity</span>
                    <h2>Recent bookings</h2>
                  </div>
                  <button className="history-button" onClick={() => setActive('My Bookings')}>History <ChevronRight size={15} /></button>
                </div>
                <Booking title="Home cleaning" detail="Completed recently" rating={5} />
                <Booking title="Electrical repair" detail="Completed recently" rating={4} />
              </section>

              <section className="section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Need assistance?</span>
                    <h2>We're here to help</h2>
                  </div>
                </div>
                <p className="help-copy">Find the right home professional for your needs.</p>
                <button className="dark-button" onClick={() => setActive('Help & Support')}>
                  Get help <ChevronRight size={16} />
                </button>
              </section>
            </aside>
          </div>
        </main>
      </div>
      {notice && <div className="toast"><Check size={17} />{notice}</div>}
    </div>
  );
}
export default App;
