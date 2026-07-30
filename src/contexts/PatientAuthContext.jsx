import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PatientAuthContext = createContext(null);

export function usePatientAuth() {
  return useContext(PatientAuthContext);
}

export function PatientAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(updates) {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;
    setProfile(prev => ({ ...prev, ...updates }));
  }

  return (
    <PatientAuthContext.Provider value={{ user, profile, loading, signIn, signOut, updateProfile }}>
      {children}
    </PatientAuthContext.Provider>
  );
}
