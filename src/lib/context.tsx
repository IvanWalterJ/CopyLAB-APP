'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BrandProfile } from './types';

interface UserCredits {
  total_credits: number;
  used_credits: number;
}

interface AppContextType {
  activeBrand: BrandProfile | null;
  setActiveBrand: (brand: BrandProfile | null) => void;
  brands: BrandProfile[];
  credits: UserCredits | null;
  refreshBrands: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  userEmail: string | null;
  userId: string | null;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeBrand, setActiveBrand] = useState<BrandProfile | null>(null);
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  const refreshBrands = useCallback(async () => {
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBrands(data as BrandProfile[]);
      // Load first active brand if none set
      if (!activeBrand && data.length > 0) {
        setActiveBrand(data[0] as BrandProfile);
      }
    }
  }, [supabase, activeBrand]);

  const refreshCredits = useCallback(async () => {
    const { data } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .single();

    if (data) setCredits(data as UserCredits);
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setUserId(user.id);
        await Promise.all([refreshBrands(), refreshCredits()]);
      }
    };
    init();
  }, [supabase.auth, refreshBrands, refreshCredits]);

  return (
    <AppContext.Provider value={{
      activeBrand,
      setActiveBrand,
      brands,
      credits,
      refreshBrands,
      refreshCredits,
      userEmail,
      userId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
