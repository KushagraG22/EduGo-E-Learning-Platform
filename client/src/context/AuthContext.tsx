import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (credential: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('edugo_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('edugo_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('edugo_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${storedToken}` } });
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('edugo_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        localStorage.removeItem('edugo_token');
        localStorage.removeItem('edugo_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('edugo_token', newToken);
        localStorage.setItem('edugo_user', JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password',
      };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('edugo_token', newToken);
        localStorage.setItem('edugo_user', JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create account',
      };
    }
  };

  const googleLogin = async (credential: string, role: UserRole = 'student') => {
    try {
      const res = await api.post('/auth/google', { credential, role });
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('edugo_token', newToken);
        localStorage.setItem('edugo_user', JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Google login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication error',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('edugo_token');
    localStorage.removeItem('edugo_user');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedData };
      setUser(updated);
      localStorage.setItem('edugo_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
