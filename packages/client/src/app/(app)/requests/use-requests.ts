import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Database } from '@terminus/supabase';

type Request = Database['status']['Tables']['requests']['Row'];

export function useRequests() {
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    }
    fetchUser();
  }, []);

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

  const createRequest = async (title: string, description: string) => {
    try {
      if (!currentUser) throw new Error('User not authenticated');

      const { error: createError } = await supabase
        .schema('status')
        .from('requests')
        .insert({
          title,
          description,
          requested_by: currentUser,
          requested_at: new Date().toISOString(),
        });

      if (createError) throw new Error(createError.message);

      await refreshRequests();
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      throw e;
    }
  };

  const editRequest = async (requestId: string, title: string, description: string) => {
    try {
      if (!currentUser) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .schema('status')
        .from('requests')
        .update({
          title,
          description,
          edited_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('requested_by', currentUser);

      if (updateError) throw new Error(updateError.message);

      await refreshRequests();
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
      throw e;
    }
  };

  const refreshRequests = async () => {
    const { data, error: fetchError } = await supabase
      .schema('status')
      .from('requests')
      .select('*')
      .is('deleted_at', null);

    if (fetchError) throw new Error(fetchError.message);
    setRequests(data);
  };

  const isRequestOwner = (requestedBy: string | null) => {
    return currentUser != null && requestedBy === currentUser;
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    editRequest,
    isRequestOwner,
    currentUser
  };
} 