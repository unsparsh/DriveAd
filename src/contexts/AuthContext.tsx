import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'advertiser' | 'driver' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // User will be set by the auth state change listener
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { name, email, password, phone, role, ...additionalData } = userData;
      
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('User registration failed');
      }
      
      // Update profile with phone number
      await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', data.user.id);
      
      // Create role-specific profile
      if (role === 'advertiser') {
        const { companyName, companyAddress, gstin } = additionalData;
        
        await supabase.from('advertisers').insert({
          user_id: data.user.id,
          company_name: companyName,
          company_address: companyAddress,
          gstin: gstin || null,
        });
      } else if (role === 'driver') {
        const { vehicleType, vehicleNumber, licenseNumber } = additionalData;
        
        await supabase.from('drivers').insert({
          user_id: data.user.id,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          license_number: licenseNumber,
        });
      }
      
      // User and profile will be set by the auth state change listener
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      setProfile(null);
      
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out');
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};