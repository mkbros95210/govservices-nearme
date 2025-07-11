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

  const fetchNotifications = useCallback(async () => {
    const sessionUser = user || supabase.auth.getSession()?.data?.session?.user;
    if (!sessionUser) {
        setNotifications([]);
        return;
    };

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        setNotifications(data as Notification[]);

    } catch (e: any) {
        console.error('Error fetching notifications:', e.message || e);
        setNotifications([]);
    }
  }, [user]);

  const fetchUserAndProfile = useCallback(async (sessionUser: any | null) => {
    // Wrap the entire operation in a try/finally to guarantee the loading state is turned off.
    try {
      setUser(sessionUser);
      if (sessionUser) {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', sessionUser.id)
              .single();

          if (error) {
              // Log error but DO NOT wipe profile on transient network errors.
              // The user is still authenticated, so we preserve the existing profile data.
              console.error('Error fetching profile on auth state change:', error.message || error);
          } else {
              setProfile(data as Profile);
              await fetchNotifications(); // Fetch notifications after getting profile
          }
      } else {
          // User is definitively logged out, so clear everything.
          setProfile(null);
          setNotifications([]);
      }
    } catch(e: any) {
        // This will catch any unexpected errors in the logic above.
        console.error('Critical error in fetchUserAndProfile:', e.message || e);
    } finally {
        setLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await fetchUserAndProfile(session?.user ?? null);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      await fetchUserAndProfile(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserAndProfile]);

  const value = { 
      user, 
      profile,
      notifications,
      isAdmin: profile?.role === 'admin',
      loading,
      refetchProfile: () => user ? fetchUserAndProfile(user) : Promise.resolve(),
      fetchNotifications,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

