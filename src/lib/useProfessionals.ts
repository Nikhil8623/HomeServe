import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { demoProfessionals, type Professional } from './professionals';

type UseProfessionalsResult = {
  professionals: Professional[];
  usingDemo: boolean;
  loading: boolean;
  error: string | null;
};

export function useProfessionals(): UseProfessionalsResult {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!supabase) {
      setProfessionals(demoProfessionals);
      setUsingDemo(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('professionals')
      .select('*')
      .order('rating', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setProfessionals(demoProfessionals);
      setUsingDemo(true);
    } else if (!data || data.length === 0) {
      setProfessionals(demoProfessionals);
      setUsingDemo(true);
    } else {
      setProfessionals(data as Professional[]);
      setUsingDemo(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { professionals, usingDemo, loading, error };
}
