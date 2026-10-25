import { FormEvent, useMemo, useState } from 'react';
import './findpros.css';

import {
  ArrowDownUp,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import {
  type Availability,
  type ProCategory,
  type Professional,
  type ProService,
  formatPrice,
  proCategories,
  proLocations,
  timeSlots,
} from '@/lib/professionals';
import { useProfessionals } from '@/lib/useProfessionals';
import { supabase } from '@/lib/supabase';

type SortKey = 'Recommended' | 'Highest Rated' | 'Lowest Price' | 'Highest Price' | 'Most Reviewed';
type RatingFilter = 'All' | '4.0+' | '4.5+' | '4.8+';
type AvailFilter = 'All' | 'Available Today' | 'Available This Week';

const sortKeys: SortKey[] = ['Recommended', 'Highest Rated', 'Lowest Price', 'Highest Price', 'Most Reviewed'];
const ratingFilters: RatingFilter[] = ['All', '4.0+', '4.5+', '4.8+'];
const availFilters: AvailFilter[] = ['All', 'Available Today', 'Available This Week'];

type ModalState =
  | { type: 'profile'; pro: Professional }
  | { type: 'book'; pro: Professional; service: ProService }
  | { type: 'confirm'; pro: Professional; service: ProService; date: string; time: string; area: string; address: string; note: string; ref: string }
  | null;

type Props = {
  userId: string | undefined;
  defaultArea?: string;
  onBookingCreated: () => void;
  onOpenMessages: () => void;
};

export default function FindProsPage({ userId, defaultArea, onBookingCreated, onOpenMessages }: Props) {
  const { professionals, usingDemo, loading, error } = useProfessionals();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | ProCategory>('All');
  const [location, setLocation] = useState<'All' | string>('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [rating, setRating] = useState<RatingFilter>('All');
  const [avail, setAvail] = useState<AvailFilter>('All');
  const [sort, setSort] = useState<SortKey>('Recommended');
  const [visibleCount, setVisibleCount] = useState(6);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('All');
    setMinPrice(0);
    setMaxPrice(2000);
    setRating('All');
    setAvail('All');
    setSort('Recommended');
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const minRating = rating === 'All' ? 0 : parseFloat(rating);
    let list = professionals.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.specialization.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchesCat = category === 'All' || p.category === category;
      const matchesLoc = location === 'All' || p.area === location;
      const matchesPrice = p.starting_price >= minPrice && p.starting_price <= maxPrice;
      const matchesRating = p.rating >= minRating;
      const matchesAvail = avail === 'All' || p.availability === avail || (avail === 'Available This Week' && p.availability === 'Available Today');
      return matchesSearch && matchesCat && matchesLoc && matchesPrice && matchesRating && matchesAvail;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'Highest Rated': return b.rating - a.rating;
        case 'Lowest Price': return a.starting_price - b.starting_price;
        case 'Highest Price': return b.starting_price - a.starting_price;
        case 'Most Reviewed': return b.reviews - a.reviews;
        default: return (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || b.rating - a.rating;
      }
    });
    return list;
  }, [professionals, search, category, location, minPrice, maxPrice, rating, avail, sort]);

  const visible = filtered.slice(0, visibleCount);

  const handleBookingSubmit = async (pro: Professional, service: ProService, date: string, time: string, area: string, address: string, note: string) => {
    const iso = new Date(`${date}T${convertTime(time)}`).toISOString();
    if (pro.is_demo || !supabase || !userId) {
      const ref = 'HS-' + Math.floor(1000 + Math.random() * 9000);
      setModal({ type: 'confirm', pro, service, date, time, area, address, note, ref });
      return;
    }
    const ref = 'HS-' + Math.floor(1000 + Math.random() * 9000);
    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: userId,
      booking_reference: ref,
      service_name: service.name,
      category: pro.category,
      professional_name: pro.name,
      professional_avatar: pro.avatar,
      professional_phone: pro.phone,
      appointment_at: iso,
      location_area: area,
      location_address: address,
      price: service.price,
      payment_status: 'Pending',
      payment_method: null,
      booking_status: 'Confirmed',
      customer_note: note || null,
    });
    if (insertError) {
      showToast('Could not save booking: ' + insertError.message);
      return;
    }
    setModal({ type: 'confirm', pro, service, date, time, area, address, note, ref });
  };

  return (
    <div className="findpros-page">
      <div className="findpros-header">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h1>Find Home Professionals</h1>
          <p className="findpros-subtitle">Discover trusted professionals for every corner of your home.</p>
        </div>
        {usingDemo && <span className="demo-badge"><Sparkles size={13} /> Demo Data</span>}
      </div>

      {error && <div className="findpros-error">Could not load professionals from the database: {error}. Showing sample professionals instead.</div>}

      <div className="findpros-controls">
        <label className="findpros-search">
          <Search size={18} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setVisibleCount(6); }} placeholder="Search electricians, plumbers, cleaners..." aria-label="Search professionals" />
          {search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
        </label>
        <button className="outline-button clear-filters" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="findpros-filters">
        <label className="filter-group"><span>Category</span>
          <select value={category} onChange={(e) => { setCategory(e.target.value as 'All' | ProCategory); setVisibleCount(6); }}>
            <option value="All">All</option>
            {proCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="filter-group"><span>Location</span>
          <select value={location} onChange={(e) => { setLocation(e.target.value); setVisibleCount(6); }}>
            <option value="All">All</option>
            {proLocations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="filter-group"><span>Max price</span>
          <input type="range" min={200} max={2000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          <strong className="range-value">{formatPrice(minPrice)} – {formatPrice(maxPrice)}</strong>
        </label>
        <label className="filter-group"><span>Rating</span>
          <select value={rating} onChange={(e) => setRating(e.target.value as RatingFilter)}>
            {ratingFilters.map((r) => <option key={r} value={r}>{r === 'All' ? 'All ratings' : r}</option>)}
          </select>
        </label>
        <label className="filter-group"><span>Availability</span>
          <select value={avail} onChange={(e) => setAvail(e.target.value as AvailFilter)}>
            {availFilters.map((a) => <option key={a} value={a}>{a === 'All' ? 'All' : a}</option>)}
          </select>
        </label>
        <label className="filter-group"><span>Sort by</span>
          <div className="sort-wrap">
            <ArrowDownUp size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {sortKeys.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </label>
      </div>

      <p className="results-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'professional' : 'professionals'} found</p>

      {loading ? (
        <div className="findpros-loading">Loading professionals...</div>
      ) : visible.length === 0 ? (
        <div className="findpros-empty">
          <Search size={32} />
          <h3>No professionals match your filters</h3>
          <p>Try adjusting your search or filters to find the right professional.</p>
          <button className="dark-button" onClick={clearFilters}>Clear Filters <ChevronRight size={16} /></button>
        </div>
      ) : (
        <>
          <div className="pro-cards-grid">
            {visible.map((p) => (
              <ProCard
                key={p.id}
                pro={p}
                onView={() => setModal({ type: 'profile', pro: p })}
                onBook={(service) => setModal({ type: 'book', pro: p, service })}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="load-more-wrap">
              <button className="outline-button" onClick={() => setVisibleCount((c) => c + 6)}>Load More ({filtered.length - visibleCount} more)</button>
            </div>
          )}
        </>
      )}

      {modal && modal.type === 'profile' && (
        <ProfileModal pro={modal.pro} onClose={() => setModal(null)} onBook={(service) => setModal({ type: 'book', pro: modal.pro, service })} onMessage={onOpenMessages} />
      )}
      {modal && modal.type === 'book' && (
        <BookingModal
          pro={modal.pro}
          service={modal.service}
          defaultArea={defaultArea}
          onClose={() => setModal(null)}
          onSubmit={(d, t, a, addr, note) => handleBookingSubmit(modal.pro, modal.service, d, t, a, addr, note)}
        />
      )}
      {modal && modal.type === 'confirm' && (
        <ConfirmModal
          pro={modal.pro}
          service={modal.service}
          date={modal.date}
          time={modal.time}
          area={modal.area}
          address={modal.address}
          note={modal.note}
          ref={modal.ref}
          isDemo={!!modal.pro.is_demo}
          onClose={() => setModal(null)}
          onGoToBookings={onBookingCreated}
        />
      )}

      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function convertTime(slot: string): string {
  const map: Record<string, string> = { '09:00 AM': '09:00', '10:00 AM': '10:00', '11:00 AM': '11:00', '12:00 PM': '12:00', '02:00 PM': '14:00', '03:00 PM': '15:00', '04:00 PM': '16:00', '05:00 PM': '17:00', '06:00 PM': '18:00' };
  return map[slot] ?? '10:00';
}

function AvailBadge({ status }: { status: Availability }) {
  const cls = status === 'Available Today' ? 'avail-today' : status === 'Available This Week' ? 'avail-week' : 'avail-busy';
  return <span className={`avail-badge ${cls}`}><Clock size={11} /> {status}</span>;
}

function ProCard({ pro, onView, onBook }: { pro: Professional; onView: () => void; onBook: (s: ProService) => void }) {
  return (
    <article className="pro-list-card">
      <div className="plc-top">
        {pro.avatar ? <img src={pro.avatar} alt={pro.name} /> : <span className="plc-avatar-fallback">{pro.name[0]}</span>}
        <div className="plc-headline">
          <div className="plc-name-row">
            <h3>{pro.name}</h3>
            {pro.verified && <span className="verified-tag" title="Verified professional"><BadgeCheck size={16} /></span>}
            {pro.is_demo && <span className="demo-mini">Demo</span>}
          </div>
          <p>{pro.specialization}</p>
          <span className="plc-cat">{pro.category}</span>
        </div>
      </div>
      <div className="plc-stats">
        <span className="plc-rating"><Star size={14} fill="currentColor" /> {pro.rating.toFixed(1)} <small>({pro.reviews})</small></span>
        <span className="plc-exp">{pro.experience_years} yrs exp</span>
        <span className="plc-area"><MapPin size={13} /> {pro.area}</span>
        <AvailBadge status={pro.availability} />
      </div>
      <div className="plc-footer">
        <span className="plc-price"><small>from</small> {formatPrice(pro.starting_price)}</span>
        <div className="plc-actions">
          <button className="outline-button sm" onClick={onView}>View Profile</button>
          <button className="dark-button sm" onClick={() => onBook(pro.services[0])}>Book Now</button>
        </div>
      </div>
    </article>
  );
}

function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function ProfileModal({ pro, onClose, onBook, onMessage }: { pro: Professional; onClose: () => void; onBook: (s: ProService) => void; onMessage: () => void }) {
  return (
    <Modal title={`${pro.name} — Profile`} onClose={onClose} wide footer={<button className="dark-button" onClick={() => onBook(pro.services[0])}>Book Now <ChevronRight size={16} /></button>}>
      <div className="profile-header">
        {pro.avatar ? <img src={pro.avatar} alt={pro.name} /> : <span className="plc-avatar-fallback large">{pro.name[0]}</span>}
        <div className="profile-headline">
          <div className="plc-name-row"><h3>{pro.name}</h3>{pro.verified && <span className="verified-tag" title="Verified"><BadgeCheck size={18} /></span>}</div>
          <p>{pro.specialization} • {pro.category}</p>
          <div className="profile-stats">
            <span><Star size={14} fill="currentColor" /> {pro.rating.toFixed(1)} ({pro.reviews} reviews)</span>
            <span><Clock size={13} /> {pro.experience_years} years experience</span>
            <span><MapPin size={13} /> {pro.area}, Mumbai</span>
            <AvailBadge status={pro.availability} />
          </div>
        </div>
      </div>
      {pro.bio && <p className="profile-bio">{pro.bio}</p>}
      <h4 className="profile-section-title">Services offered</h4>
      <div className="profile-services">
        {pro.services.map((s) => (
          <div key={s.name} className="profile-service-row">
            <div><strong>{s.name}</strong></div>
            <span className="profile-service-price">{formatPrice(s.price)}</span>
            <button className="small-button" onClick={() => onBook(s)}>Book</button>
          </div>
        ))}
      </div>
      <h4 className="profile-section-title">Service areas</h4>
      <p className="profile-areas"><MapPin size={14} /> {pro.area}, Mumbai</p>
      <div className="profile-contact">
        {pro.phone && <a href={`tel:${pro.phone.replace(/\s/g, '')}`} className="contact-option"><Phone size={16} /><span>Call {pro.phone}</span></a>}
        <button className="contact-option" onClick={onMessage}><Mail size={16} /><span>Send a message</span></button>
      </div>
    </Modal>
  );
}

function BookingModal({ pro, service, defaultArea, onClose, onSubmit }: {
  pro: Professional;
  service: ProService;
  defaultArea?: string;
  onClose: () => void;
  onSubmit: (date: string, time: string, area: string, address: string, note: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [serviceSel, setServiceSel] = useState<ProService>(service);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(timeSlots[1]);
  const [area, setArea] = useState(defaultArea || pro.area);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) { setSubmitted(true); return; }
    onSubmit(date, time, area, address.trim(), note.trim());
  };

  return (
    <Modal title={`Book ${pro.name}`} onClose={onClose} footer={<>
      <button className="outline-button" onClick={onClose}>Cancel</button>
      <button className="dark-button" form="booking-form" type="submit">Confirm Booking</button>
    </>}>
      <form id="booking-form" onSubmit={handleSubmit} className="booking-form">
        <label className="modal-field">Service
          <select value={serviceSel.name} onChange={(e) => { const s = pro.services.find((x) => x.name === e.target.value); if (s) setServiceSel(s); }}>
            {pro.services.map((s) => <option key={s.name} value={s.name}>{s.name} — {formatPrice(s.price)}</option>)}
          </select>
        </label>
        <div className="form-row">
          <label className="modal-field">Date<input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required /></label>
          <label className="modal-field">Time slot
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <label className="modal-field">Service area
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            {proLocations.map((l) => <option key={l} value={l}>{l}, Mumbai</option>)}
          </select>
        </label>
        <label className="modal-field">Full address<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat / building, street, landmark" required />{submitted && !address.trim() && <small className="field-error">Address is required.</small>}</label>
        <label className="modal-field">Additional instructions (optional)<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special requests or details..." rows={3} /></label>
        <div className="price-breakdown">
          <h4>Price breakdown</h4>
          <div className="price-row"><span>Service fee</span><span>{formatPrice(serviceSel.price)}</span></div>
          <div className="price-row"><span>Visit charge</span><span>Included</span></div>
          <div className="price-row total"><span>Total (est.)</span><strong>{formatPrice(serviceSel.price)}</strong></div>
        </div>
      </form>
    </Modal>
  );
}

function ConfirmModal({ pro, service, date, time, area, address, note, ref, isDemo, onClose, onGoToBookings }: {
  pro: Professional;
  service: ProService;
  date: string;
  time: string;
  area: string;
  address: string;
  note: string;
  ref: string;
  isDemo: boolean;
  onClose: () => void;
  onGoToBookings: () => void;
}) {
  return (
    <Modal title="Booking Confirmed" onClose={onClose} footer={<>
      <button className="outline-button" onClick={onClose}>Close</button>
      <button className="dark-button" onClick={onGoToBookings}>View in Bookings <ChevronRight size={16} /></button>
    </>}>
      <div className="confirm-icon-wrap"><Check size={32} /></div>
      <h3 className="confirm-title">Your booking is confirmed{isDemo && ' (Demo)'}</h3>
      <p className="confirm-ref">Booking reference: <strong>{ref}</strong></p>
      <div className="confirm-summary">
        <div className="confirm-row"><span>Professional</span><strong>{pro.name}</strong></div>
        <div className="confirm-row"><span>Service</span><strong>{service.name}</strong></div>
        <div className="confirm-row"><span>Appointment</span><strong>{date} at {time}</strong></div>
        <div className="confirm-row"><span>Location</span><strong>{address}, {area}, Mumbai</strong></div>
        <div className="confirm-row"><span>Price</span><strong>{formatPrice(service.price)}</strong></div>
        {note && <div className="confirm-row"><span>Note</span><strong>{note}</strong></div>}
      </div>
      {isDemo && <p className="confirm-demo-note">This is a demo booking and was not saved to the database.</p>}
    </Modal>
  );
}
