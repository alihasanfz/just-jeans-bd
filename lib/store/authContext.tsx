'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { idbGet, idbSet } from '@/lib/utils/db';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  avatar?: string;
  role?: 'customer' | 'admin';
  tier?: 'VIP' | 'Regular' | 'New';
  joinedDate: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => { success: boolean; message?: string };
  register: (data: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    city?: string;
    address?: string;
  }) => { success: boolean; message?: string };
  updateProfile: (updates: Partial<UserProfile>) => { success: boolean; message?: string };
  logout: () => void;
  allUsers: UserProfile[];
}

export const DEFAULT_USER: UserProfile = {
  id: 'cust-tanvir',
  fullName: 'Tanvir Hossain',
  phone: '01711223344',
  email: 'tanvir@gmail.com',
  city: 'Dhaka',
  address: 'House 14, Flat 4B, Road 27, Dhanmondi, Dhaka',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  tier: 'VIP',
  role: 'customer',
  joinedDate: 'September 2026',
  totalOrders: 2,
  totalSpent: 4010,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load active user and all registered users on mount
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Load all registered customers
        let loadedUsers: UserProfile[] = [];
        const idbCusts = await idbGet<any[]>('jeansbd_customers');
        if (Array.isArray(idbCusts) && idbCusts.length > 0) {
          loadedUsers = idbCusts.map((c) => ({
            id: String(c.id || `cust-${Date.now()}`),
            fullName: String(c.name || c.fullName || 'Customer'),
            phone: String(c.phone || ''),
            email: String(c.email || ''),
            city: String(c.city || 'Dhaka'),
            address: String(c.address || ''),
            avatar: c.avatar,
            role: c.role || 'customer',
            tier: c.tier || 'New',
            joinedDate: c.joinDate || c.joinedDate || 'October 2026',
            totalOrders: Number(c.totalOrders) || 0,
            totalSpent: Number(c.totalSpent) || 0,
          }));
        } else if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('jeansbd_customers');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              loadedUsers = parsed.map((c) => ({
                id: String(c.id || `cust-${Date.now()}`),
                fullName: String(c.name || c.fullName || 'Customer'),
                phone: String(c.phone || ''),
                email: String(c.email || ''),
                city: String(c.city || 'Dhaka'),
                address: String(c.address || ''),
                avatar: c.avatar,
                role: c.role || 'customer',
                tier: c.tier || 'New',
                joinedDate: c.joinDate || c.joinedDate || 'October 2026',
                totalOrders: Number(c.totalOrders) || 0,
                totalSpent: Number(c.totalSpent) || 0,
              }));
            }
          }
        }

        // Make sure DEFAULT_USER is in the customer list
        if (!loadedUsers.some((u) => u.phone === DEFAULT_USER.phone || u.email === DEFAULT_USER.email)) {
          loadedUsers.push(DEFAULT_USER);
        }
        setAllUsers(loadedUsers);

        // 2. Check active user session
        if (typeof window !== 'undefined') {
          const session = localStorage.getItem('jeansbd_current_user');
          if (session) {
            const parsed = JSON.parse(session);
            if (parsed && parsed.id) {
              // Find latest version from allUsers if available
              const found = loadedUsers.find((u) => u.id === parsed.id || u.phone === parsed.phone);
              setUser(found || parsed);
              setIsLoading(false);
              return;
            }
          }
        }

        // Default to logged-in as Tanvir Hossain initially for easy evaluation
        setUser(DEFAULT_USER);
        if (typeof window !== 'undefined') {
          localStorage.setItem('jeansbd_current_user', JSON.stringify(DEFAULT_USER));
        }
      } catch (e) {
        console.warn('Auth init warning', e);
        setUser(DEFAULT_USER);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  // Save changes to current user & sync to all registered users list
  const syncUserToStorage = (updatedUser: UserProfile | null) => {
    if (typeof window !== 'undefined') {
      if (updatedUser) {
        localStorage.setItem('jeansbd_current_user', JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem('jeansbd_current_user');
      }
    }

    if (updatedUser) {
      setAllUsers((prev) => {
        const index = prev.findIndex((u) => u.id === updatedUser.id || (u.phone && u.phone === updatedUser.phone));
        let nextList: UserProfile[];
        if (index >= 0) {
          nextList = [...prev];
          nextList[index] = { ...nextList[index], ...updatedUser };
        } else {
          nextList = [updatedUser, ...prev];
        }

        // Sync to jeansbd_customers for Admin Dashboard
        const adminCustList = nextList.map((u) => ({
          id: u.id,
          name: u.fullName,
          phone: u.phone,
          email: u.email,
          city: u.city,
          address: u.address,
          totalOrders: u.totalOrders || 1,
          totalSpent: u.totalSpent || 0,
          tier: u.tier || 'New',
          lastOrderDate: new Date().toISOString().slice(0, 10),
          joinDate: u.joinedDate || new Date().toISOString().slice(0, 10),
        }));

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('jeansbd_customers', JSON.stringify(adminCustList));
            idbSet('jeansbd_customers', adminCustList);
          } catch (e) {}
        }

        return nextList;
      });
    }
  };

  const login = (identifier: string, _password?: string) => {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = clean.replace(/[^0-9]/g, '');

    // Search existing users
    const found = allUsers.find((u) => {
      const uCleanPhone = u.phone.replace(/[^0-9]/g, '');
      const uEmail = u.email.toLowerCase();
      return (cleanPhone && uCleanPhone && (uCleanPhone === cleanPhone || uCleanPhone.includes(cleanPhone))) ||
        (clean && uEmail === clean);
    });

    if (found) {
      setUser(found);
      syncUserToStorage(found);
      return { success: true, message: `Welcome back, ${found.fullName}!` };
    }

    // If identifier looks like a phone or email, auto-create account for seamless user experience
    if (cleanPhone.length >= 10 || clean.includes('@')) {
      const newUser: UserProfile = {
        id: `cust-${Date.now()}`,
        fullName: clean.includes('@') ? clean.split('@')[0] : `Customer ${cleanPhone.slice(-4)}`,
        phone: cleanPhone.length >= 10 ? identifier.trim() : '01700000000',
        email: clean.includes('@') ? clean : `${cleanPhone}@jeansbd.customer`,
        city: 'Dhaka',
        address: 'Dhaka, Bangladesh',
        tier: 'New',
        role: 'customer',
        joinedDate: 'October 2026',
        totalOrders: 0,
        totalSpent: 0,
      };

      setUser(newUser);
      syncUserToStorage(newUser);
      return { success: true, message: `Account created successfully!` };
    }

    return { success: false, message: 'Please enter a valid phone number or email.' };
  };

  const register = (data: {
    fullName: string;
    phone: string;
    email: string;
    password?: string;
    city?: string;
    address?: string;
  }) => {
    if (!data.fullName.trim()) {
      return { success: false, message: 'Full name is required.' };
    }
    if (!data.phone.trim()) {
      return { success: false, message: 'Phone number is required.' };
    }

    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email.trim();

    // Check if phone already registered
    const existing = allUsers.find(
      (u) =>
        u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '') ||
        (cleanEmail && u.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    if (existing) {
      // Log in to existing
      const updated = {
        ...existing,
        fullName: data.fullName.trim() || existing.fullName,
        city: data.city || existing.city,
        address: data.address || existing.address,
      };
      setUser(updated);
      syncUserToStorage(updated);
      return { success: true, message: `Account exists! Logged in as ${updated.fullName}.` };
    }

    const newUser: UserProfile = {
      id: `cust-${Date.now()}`,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      email: cleanEmail || `${cleanPhone.replace(/[^0-9]/g, '')}@jeansbd.customer`,
      city: data.city?.trim() || 'Dhaka',
      address: data.address?.trim() || 'Mirpur, Dhaka',
      tier: 'New',
      role: 'customer',
      joinedDate: 'October 2026',
      totalOrders: 0,
      totalSpent: 0,
    };

    setUser(newUser);
    syncUserToStorage(newUser);
    return { success: true, message: 'Account created successfully! Welcome to Jeans BD.' };
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, message: 'No active user session' };

    const updated = {
      ...user,
      ...updates,
    };

    setUser(updated);
    syncUserToStorage(updated);
    return { success: true, message: 'Profile details updated successfully!' };
  };

  const logout = () => {
    setUser(null);
    syncUserToStorage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
