"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loader from "../components/Loader";

type User = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  age: number | null;
  gender: string | null;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  deleteAccount: () => Promise<{ success: boolean; message?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];
const OPEN_ROUTES = ['/admin']; // Routes accessible to everyone (logged in or not)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect logic - only after auth check is complete
  useEffect(() => {
    if (!isLoading && hasCheckedAuth) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      const isOpenRoute = pathname.startsWith('/admin');

      if (!user && !isPublicRoute && !isOpenRoute) {
        // Not authenticated, redirect to login (except for open routes)
        router.push('/login');
      } else if (user && isPublicRoute) {
        // Already authenticated, redirect to home (but allow open routes)
        router.push('/');
      }
    }
  }, [user, isLoading, hasCheckedAuth, pathname, router]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success) {
        setUser(data.user);
        router.push('/');
        return { success: true };
      } else {
        const errorMessage = data?.message || `Login failed (Status: ${response.status})`;
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error or server unavailable. Please check your connection.' };
    }
  };

  // Helper to safely parse JSON response
  const safeJson = async (response: Response) => {
    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const register = async (email: string, password: string, name: string, otp: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        router.push('/');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('cart'); // Clear cart on logout
      router.push('/login');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(null);
        localStorage.removeItem('cart');
        router.push('/');
        return { success: true };
      } else {
        return { success: false, message: result.message || 'Deletion failed' };
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
      }}
    >
      {isLoading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8d5d5 100%)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px',
          }}>
            <div style={{ margin: '0 auto 16px' }}>
              <Loader />
            </div>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}></p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
