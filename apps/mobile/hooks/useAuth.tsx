import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { UserWithProfile } from '@tribhuvan/shared';
import api, { getToken, saveToken, removeToken } from '../services/api';

interface AuthContextType {
  user: UserWithProfile | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, user: UserWithProfile) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserWithProfile | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  setSession: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          setToken(storedToken);
          const response = await api.get('/auth/me');
          setUser(response.data.data);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Error restoring auth session:', err);
        await removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const setSession = async (newToken: string, newUser: UserWithProfile) => {
    await saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = async () => {
    await removeToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch {
      await signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setSession,
        signOut,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
