import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type AuthUser = { name: string };
type AuthContextValue = {
  user: AuthUser | null;
  login: (name: string) => void;
  logout: () => void;
};

const AUTH_KEY = 'site-ledger-user';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) as AuthUser : null;
    } catch {
      return null;
    }
  });

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: (name) => {
      const next = { name: name.trim() || 'Site manager' };
      localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      setUser(next);
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
