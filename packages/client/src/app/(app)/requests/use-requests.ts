import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '@terminus/supabase';

type Request = Database['status']['Tables']['requests']['Row'];

export function useRequests() {
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const { data, error } = await supabase
          .schema('status')
          .from('requests')
          .select('*')
          .is('deleted_at', null);

        if (error) throw new Error(error.message);

        setRequests(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, loading, error };
} 