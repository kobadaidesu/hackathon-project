import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { signup, login, logout, getToken } from '../lib/auth';
import { apiRequest } from '../api/apiClient';
import type { UserProfile } from '../types/profile';

type AuthContextValue = {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signupAndInit: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCurrentUser = async () => {
    const token = await getToken();
    if (!token) {
      setCurrentUser(null);
      return;
    }
    try {
      const user = await apiRequest<UserProfile>('/api/users/me');
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    // アプリ起動時に、今ログインしているかどうかを確認する
    refreshCurrentUser().finally(() => setIsLoading(false));
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    await refreshCurrentUser();
  };

  const signupAndInit = async (email: string, password: string, displayName: string) => {
    await signup(email, password);
    await apiRequest('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName }),
    });
    await refreshCurrentUser();
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login: handleLogin,
        signupAndInit,
        logout: handleLogout,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthはAuthProviderの中で使ってください');
  }
  return context;
}