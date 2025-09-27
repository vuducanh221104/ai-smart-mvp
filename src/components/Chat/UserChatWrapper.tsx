"use client";
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import UserChat from './UserChat';

export default function UserChatWrapper() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading || !userId) {
    return null; // Don't render chat until user is loaded
  }

  return <UserChat userId={userId} />;
}
