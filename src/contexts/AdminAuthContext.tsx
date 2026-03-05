import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

// ─── localStorage fallback (when Supabase is not configured) ─────────

const LS_AUTH_KEY = 'seh_admin_credentials';
const LS_SESSION_KEY = 'seh_admin_session';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

function lsGetCreds() {
  try {
    const raw = localStorage.getItem(LS_AUTH_KEY);
    if (raw) return JSON.parse(raw) as { username: string; passwordHash: string };
  } catch { /* ignore */ }
  return { username: 'admin@sunelitehomes.com', passwordHash: simpleHash('admin123') };
}

// ─── Provider ────────────────────────────────────────────────────────

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback state (non-Supabase)
  const [lsAuth, setLsAuth] = useState(
    () => sessionStorage.getItem(LS_SESSION_KEY) === 'true',
  );
  const [lsUser, setLsUser] = useState<string | null>(() =>
    sessionStorage.getItem(LS_SESSION_KEY) === 'true'
      ? sessionStorage.getItem(LS_SESSION_KEY + '_user') || 'admin'
      : null,
  );

  // Listen to Supabase auth changes
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      const creds = lsGetCreds();
      if (email === creds.username && simpleHash(password) === creds.passwordHash) {
        setLsAuth(true);
        setLsUser(email);
        sessionStorage.setItem(LS_SESSION_KEY, 'true');
        sessionStorage.setItem(LS_SESSION_KEY + '_user', email);
        return true;
      }
      return false;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLsAuth(false);
      setLsUser(null);
      sessionStorage.removeItem(LS_SESSION_KEY);
      sessionStorage.removeItem(LS_SESSION_KEY + '_user');
      return;
    }

    await supabase.auth.signOut();
  }, []);

  const changePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      const creds = lsGetCreds();
      creds.passwordHash = simpleHash(newPassword);
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(creds));
      return true;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  }, []);

  const isAuthenticated = isSupabaseConfigured() ? !!user : lsAuth;
  const username = isSupabaseConfigured() ? (user?.email ?? null) : lsUser;

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, username, loading, login, logout, changePassword }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
