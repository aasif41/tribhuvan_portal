import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { UserWithProfile } from '@tribhuvan/shared';

interface AuthContextType {
  user: UserWithProfile | null;
  loading: boolean;
  setUser: (user: UserWithProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
