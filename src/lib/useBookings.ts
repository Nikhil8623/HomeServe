import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { demoBookings, type Booking } from './bookings';

type UseBookingsResult = {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  usingDemo: boolean;
  refresh: () => Promise<void>;
  updateBooking: (id: string, patch: Partial<Booking>) => Promise<{ error: string | null }>;
};

export function useBookings(userId: string | undefined): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!supabase || !userId) {
      setBookings(demoBookings);
      setUsingDemo(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setBookings(demoBookings);
      setUsingDemo(true);
    } else if (!data || data.length === 0) {
      setBookings(demoBookings);
      setUsingDemo(true);
    } else {
      setBookings(data as Booking[]);
      setUsingDemo(false);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const updateBooking = useCallback(
    async (id: string, patch: Partial<Booking>): Promise<{ error: string | null }> => {
      const demo = bookings.find((b) => b.id === id);
      if (demo?.is_demo) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
        return { error: null };
      }
      if (!supabase) return { error: 'Database is not available.' };
      const { error: updateError } = await supabase.from('bookings').update(patch).eq('id', id);
      if (updateError) return { error: updateError.message };
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      return { error: null };
    },
    [bookings],
  );

  return { bookings, loading, error, usingDemo, refresh: fetchBookings, updateBooking };
}
