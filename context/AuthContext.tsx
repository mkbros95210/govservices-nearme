
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Notification } from '../types';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  notifications: Notification[];
  isAdmin: boolean;
  loading: boolean;
  refetchProfile: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, notifications: [], isAdmin: false, loading: true, refetchProfile: async () => {}, fetchNotifications: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserAndProfile = useCallback(async (sessionUser: any) => {
    setUser(sessionUser);

    if (sessionUser) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profileError) {
          throw new Error(`Failed to fetch profile: ${profileError.message}`);
        }
        
        setProfile(profileData as Profile);
        
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', sessionUser.id)
          .order('created_at', { ascending: false });

        if (notificationsError) {
          console.error('Failed to fetch notifications:', notificationsError.message);
        }
        setNotifications(notificationsData || []);

      } catch (error) {
        console.error(error);
        // On failure, ensure state is clean for this user
        setProfile(null);
        setNotifications([]);
      }
    } else {
      // User is logged out, clear all data
      setProfile(null);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    // This effect runs once on mount to set up the auth listener.
    // It is the single source of truth for auth state.
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await fetchUserAndProfile(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserAndProfile]);
  
  const refetchAll = useCallback(async () => {
    if (user) {
        setLoading(true);
        await fetchUserAndProfile(user);
        setLoading(false);
    }
  }, [user, fetchUserAndProfile]);
  
  const justFetchNotifications = useCallback(async () => {
      if (!user) return;
      const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (notificationsError) {
            console.error('Failed to fetch notifications:', notificationsError.message);
        }
        setNotifications(notificationsData || []);
  }, [user]);

  const value = { 
      user, 
      profile,
      notifications,
      isAdmin: profile?.role === 'admin',
      loading,
      refetchProfile: refetchAll,
      fetchNotifications: justFetchNotifications,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


