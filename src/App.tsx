import { useMemo, useState } from 'react';
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
  'Bandra West',
  'Andheri West',
  'Juhu',
  'Powai',
  'Worli',
  'Dadar',
  'Goregaon',
  'Colaba',
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
  const [active, setActive] = useState('Home');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [area, setArea] = useState(mumbaiAreas[0]);
  const [areaOpen, setAreaOpen] = useState(false);

  const filteredPros = useMemo(() => pros.filter((pro) => `${pro.name} ${pro.role}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

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
              <button className="area-trigger" onClick={() => setAreaOpen((value) => !value)} aria-label="Select area" aria-expanded={areaOpen}>
                <MapPin size={13} /> <strong>{area}, Mumbai</strong> <ChevronRight size={14} className={`area-caret ${areaOpen ? 'area-caret-open' : ''}`} />
              </button>
              {areaOpen && (
                <ul className="area-menu" role="listbox">
                  {mumbaiAreas.map((name) => (
                    <li key={name}>
                      <button className={area === name ? 'selected' : ''} onClick={() => { setArea(name); setAreaOpen(false); showNotice(`Showing professionals in ${name}, Mumbai.`); }} role="option" aria-selected={area === name}><MapPin size={14} /> {name}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="icon-button" onClick={() => showNotice('You are all caught up.')} aria-label="Notifications"><Bell size={21} /></button>
            <button className="avatar" onClick={() => setActive('Profile')} aria-label="Open profile">AR</button>
          </div>
        </header>

        <main className="content">
          <section className="welcome"><div><span className="eyebrow">Dashboard</span><h1>Good morning, Arjun</h1></div><button className="outline-button mobile-hide" onClick={() => showNotice('Your home profile is up to date.')}>Manage home <ChevronRight size={16} /></button></section>
          <p className="location-banner"><MapPin size={15} /> Showing home service professionals in <strong>{area}, Mumbai</strong></p>
          <div className="dashboard-grid">
            <div className="primary-column">
              <section className="section appointment-section"><div className="section-heading"><h2>Your Next Appointment</h2><span className="section-kicker">Tomorrow</span></div><div className="appointment-card"><div className="appointment-icon"><Wrench size={25} /></div><div className="appointment-info"><h3>Plumbing Inspection</h3><p>Tomorrow, 10:00 AM <span>•</span> with Suresh K. <span>•</span> ₹499</p></div><button className="dark-button" onClick={() => showNotice('Opening your plumbing appointment.')}>Manage Booking</button></div></section>
              <section className="section"><div className="section-heading"><h2>Quick Actions</h2><button className="text-button" onClick={() => showNotice('Showing all available services.')}>View all services <ChevronRight size={15} /></button></div><div className="service-grid">{services.map(({ label, icon: Icon }) => <button className="service-card" key={label} onClick={() => showNotice(`Finding ${label.toLowerCase()} professionals near you.`)}><span className="service-icon"><Icon size={22} /></span><span>{label}</span></button>)}</div></section>
              <section className="section recommendations"><div className="section-heading"><h2>Recommended for You</h2><button className="text-button mobile-hide" onClick={() => showNotice('Recommendations refreshed.')}>Refresh recommendations <Sparkles size={15} /></button></div><div className="pro-grid">{filteredPros.map((pro) => <article className="pro-card" key={pro.name}><img src={pro.image} alt={`${pro.name}, ${pro.role}`} /><div className="pro-copy"><h3>{pro.name}</h3><p>{pro.role}</p></div><div className="pro-footer"><span className="price"><span className="from">from</span> {pro.price}</span><span className="rating"><Star size={15} fill="currentColor" /> {pro.rating}</span></div><button className="small-button pro-cta" onClick={() => showNotice(`Opening ${pro.name}'s profile.`)}>View Profile</button></article>)}{filteredPros.length === 0 && <div className="empty-state">No professionals match “{search}”.</div>}</div></section>
            </div>
            <aside className="right-column"><section className="section recent-section"><div className="section-heading"><h2>Recent Bookings</h2><button className="more-button" aria-label="More booking options">•••</button></div><div className="booking-list"><Booking title="Deep House Cleaning" detail="Oct 12 • Priya Clean Care • ₹799" rating={5} /><Booking title="AC Servicing" detail="Sep 05 • CoolBreeze AC Service • ₹599" rating={4} /></div><button className="history-button" onClick={() => setActive('Bookings')}>View full history <ChevronRight size={15} /></button></section><section className="plus-card"><div className="plus-decoration" /><div className="plus-icon"><Sparkles size={24} /></div><h3>HomeServe Plus</h3><p>Get 10% off all bookings and priority support.</p><span className="plus-price">Starts at ₹199/month</span><button className="dark-button" onClick={() => showNotice('HomeServe Plus details are coming right up.')}>Upgrade Now</button></section></aside>
          </div>
        </main>
      </div>
      {notice && <div className="toast"><Check size={17} />{notice}</div>}
    </div>
  );
}

function Booking({ title, detail, rating }: { title: string; detail: string; rating: number }) {
  return <div className="booking-card"><div className="booking-top"><div><h3>{title}</h3><p>{detail}</p></div><span className="status">Completed</span></div><div className="booking-rating">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} fill={index < rating ? 'currentColor' : 'none'} />)}</div></div>;
}

export default App;
