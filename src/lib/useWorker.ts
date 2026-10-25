import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  demoWorkerAvailability,
  demoWorkerBookings,
  demoWorkerPortfolio,
  demoWorkerProfile,
  demoWorkerQualifications,
  demoWorkerReviews,
  demoWorkerServices,
  generateWorkerId,
  type WorkerAvailability,
  type WorkerBooking,
  type WorkerPortfolioItem,
  type WorkerProfile,
  type WorkerQualification,
  type WorkerReview,
  type WorkerService,
} from './worker';

type WorkerData = {
  profile: WorkerProfile;
  services: WorkerService[];
  qualifications: WorkerQualification[];
  availability: WorkerAvailability;
  portfolio: WorkerPortfolioItem[];
  reviews: WorkerReview[];
  bookings: WorkerBooking[];
  usingDemo: boolean;
  loading: boolean;
  error: string | null;
  saveProfile: (patch: Partial<WorkerProfile>) => Promise<{ error: string | null }>;
  saveAvailability: (patch: Partial<WorkerAvailability>) => Promise<{ error: string | null }>;
  addService: (s: Omit<WorkerService, 'id' | 'worker_id'>) => Promise<{ error: string | null }>;
  updateService: (id: string, patch: Partial<WorkerService>) => Promise<{ error: string | null }>;
  deleteService: (id: string) => Promise<{ error: string | null }>;
  addQualification: (q: Omit<WorkerQualification, 'id' | 'worker_id'>) => Promise<{ error: string | null }>;
  deleteQualification: (id: string) => Promise<{ error: string | null }>;
  addPortfolio: (p: Omit<WorkerPortfolioItem, 'id' | 'worker_id'>) => Promise<{ error: string | null }>;
  deletePortfolio: (id: string) => Promise<{ error: string | null }>;
  updateBookingStatus: (id: string, status: WorkerBooking['booking_status']) => Promise<{ error: string | null }>;
};

export function useWorker(userId: string | undefined, email: string | undefined, fullName: string): WorkerData {
  const [profile, setProfile] = useState<WorkerProfile>(demoWorkerProfile);
  const [services, setServices] = useState<WorkerService[]>(demoWorkerServices);
  const [qualifications, setQualifications] = useState<WorkerQualification[]>(demoWorkerQualifications);
  const [availability, setAvailability] = useState<WorkerAvailability>(demoWorkerAvailability);
  const [portfolio, setPortfolio] = useState<WorkerPortfolioItem[]>(demoWorkerPortfolio);
  const [reviews] = useState<WorkerReview[]>(demoWorkerReviews);
  const [bookings, setBookings] = useState<WorkerBooking[]>(demoWorkerBookings);
  const [usingDemo, setUsingDemo] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!supabase || !userId) {
      setUsingDemo(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const [{ data: pRow }, { data: sRows }, { data: qRows }, { data: aRow }, { data: poRows }] = await Promise.all([
      supabase.from('worker_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('worker_services').select('*'),
      supabase.from('worker_qualifications').select('*'),
      supabase.from('worker_availability').select('*').maybeSingle(),
      supabase.from('worker_portfolio').select('*'),
    ]);

    if (!pRow) {
      // No profile yet — create one automatically
      const newProfile = {
        user_id: userId,
        worker_id: generateWorkerId(),
        full_name: fullName || 'New Worker',
        email: email ?? '',
      };
      const { data: created, error: createErr } = await supabase.from('worker_profiles').insert(newProfile).select().single();
      if (createErr) {
        setError(createErr.message);
        setUsingDemo(true);
        setLoading(false);
        return;
      }
      setProfile(created as WorkerProfile);
      setServices([]);
      setQualifications([]);
      setAvailability({ ...demoWorkerAvailability, id: 'temp', worker_id: (created as WorkerProfile).id, is_demo: false });
      setPortfolio([]);
      setUsingDemo(false);
      setLoading(false);
      return;
    }

    const wp = pRow as WorkerProfile;
    setProfile(wp);
    setServices((sRows as WorkerService[]) ?? []);
    setQualifications((qRows as WorkerQualification[]) ?? []);
    setAvailability((aRow as WorkerAvailability) ?? { ...demoWorkerAvailability, id: 'temp', worker_id: wp.id, is_demo: false });
    setPortfolio((poRows as WorkerPortfolioItem[]) ?? []);
    setUsingDemo(false);
    setLoading(false);
  }, [userId, email, fullName]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const saveProfile = useCallback(async (patch: Partial<WorkerProfile>): Promise<{ error: string | null }> => {
    if (profile.is_demo || !supabase) {
      setProfile((prev) => ({ ...prev, ...patch }));
      return { error: null };
    }
    const { error: e } = await supabase.from('worker_profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', profile.id);
    if (e) return { error: e.message };
    setProfile((prev) => ({ ...prev, ...patch }));
    return { error: null };
  }, [profile]);

  const saveAvailability = useCallback(async (patch: Partial<WorkerAvailability>): Promise<{ error: string | null }> => {
    if (availability.is_demo || !supabase) {
      setAvailability((prev) => ({ ...prev, ...patch }));
      return { error: null };
    }
    const { error: e } = await supabase.from('worker_availability').update({ ...patch, updated_at: new Date().toISOString() }).eq('worker_id', profile.id);
    if (e) return { error: e.message };
    setAvailability((prev) => ({ ...prev, ...patch }));
    return { error: null };
  }, [availability, profile]);

  const addService = useCallback(async (s: Omit<WorkerService, 'id' | 'worker_id'>): Promise<{ error: string | null }> => {
    if (profile.is_demo || !supabase) {
      const ns: WorkerService = { ...s, id: 'local-' + Date.now(), worker_id: profile.id, is_demo: true };
      setServices((prev) => [...prev, ns]);
      return { error: null };
    }
    const { data, error: e } = await supabase.from('worker_services').insert({ ...s, worker_id: profile.id }).select().single();
    if (e) return { error: e.message };
    setServices((prev) => [...prev, data as WorkerService]);
    return { error: null };
  }, [profile]);

  const updateService = useCallback(async (id: string, patch: Partial<WorkerService>): Promise<{ error: string | null }> => {
    const s = services.find((x) => x.id === id);
    if (s?.is_demo || !supabase) {
      setServices((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
      return { error: null };
    }
    const { error: e } = await supabase.from('worker_services').update(patch).eq('id', id);
    if (e) return { error: e.message };
    setServices((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    return { error: null };
  }, [services]);

  const deleteService = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const s = services.find((x) => x.id === id);
    if (s?.is_demo || !supabase) {
      setServices((prev) => prev.filter((x) => x.id !== id));
      return { error: null };
    }
    const { error: e } = await supabase.from('worker_services').delete().eq('id', id);
    if (e) return { error: e.message };
    setServices((prev) => prev.filter((x) => x.id !== id));
    return { error: null };
  }, [services]);

  const addQualification = useCallback(async (q: Omit<WorkerQualification, 'id' | 'worker_id'>): Promise<{ error: string | null }> => {
    if (profile.is_demo || !supabase) {
      const nq: WorkerQualification = { ...q, id: 'local-' + Date.now(), worker_id: profile.id, is_demo: true };
      setQualifications((prev) => [...prev, nq]);
      return { error: null };
    }
    const { data, error: e } = await supabase.from('worker_qualifications').insert({ ...q, worker_id: profile.id }).select().single();
    if (e) return { error: e.message };
    setQualifications((prev) => [...prev, data as WorkerQualification]);
    return { error: null };
  }, [profile]);

  const deleteQualification = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const q = qualifications.find((x) => x.id === id);
    if (q?.is_demo || !supabase) {
      setQualifications((prev) => prev.filter((x) => x.id !== id));
      return { error: null };
    }
    const { error: e } = await supabase.from('worker_qualifications').delete().eq('id', id);
    if (e) return { error: e.message };
    setQualifications((prev) => prev.filter((x) => x.id !== id));
    return { error: null };
  }, [qualifications]);

  const addPortfolio = useCallback(async (p: Omit<WorkerPortfolioItem, 'id' | 'worker_id'>): Promise<{ error: string | null }> => {
    if (profile.is_demo || !supabase) {
      const np: WorkerPortfolioItem = { ...p, id: 'local-' + Date.now(), worker_id: profile.id, is_demo: true };
      setPortfolio((prev) => [...prev, np]);
      return { error: null };
    }
    const { data, error: e } = await supabase.from('worker_portfolio').insert({ ...p, worker_id: profile.id }).select().single();
    if (e) return { error: e.message };
    setPortfolio((prev) => [...prev, data as WorkerPortfolioItem]);
    return { error: null };
  }, [profile]);

  const deletePortfolio = useCallback(async (id: string): Promise<{ error: string | null }> => {
    const p = portfolio.find((x) => x.id === id);
    if (p?.is_demo || !supabase) {
      setPortfolio((prev) => prev.filter((x) => x.id !== id));
      return { error: null };
    }
    const { error: e } = await supabase.from('worker_portfolio').delete().eq('id', id);
    if (e) return { error: e.message };
    setPortfolio((prev) => prev.filter((x) => x.id !== id));
    return { error: null };
  }, [portfolio]);

  const updateBookingStatus = useCallback(async (id: string, status: WorkerBooking['booking_status']): Promise<{ error: string | null }> => {
    const b = bookings.find((x) => x.id === id);
    if (b?.is_demo) {
      setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, booking_status: status } : x)));
      return { error: null };
    }
    // Real worker bookings would go through a separate table; for now update locally
    setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, booking_status: status } : x)));
    return { error: null };
  }, [bookings]);

  return {
    profile, services, qualifications, availability, portfolio, reviews, bookings,
    usingDemo, loading, error,
    saveProfile, saveAvailability, addService, updateService, deleteService,
    addQualification, deleteQualification, addPortfolio, deletePortfolio, updateBookingStatus,
  };
}
