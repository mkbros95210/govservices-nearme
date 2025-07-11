
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

  // This effect runs once on mount and sets up the auth listener.
  // It is the single source of truth for the user's session and profile.
  useEffect(() => {
    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        // User is logged in, fetch their profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // If profile fetch fails, we can't know their role.
          // Treat them as a non-admin user, but keep them logged in.
          setProfile(null); 
          setNotifications([]);
        } else {
          setProfile(profileData as Profile);
          // Profile fetch was successful, now fetch notifications
          const { data: notificationsData } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false });
          setNotifications(notificationsData || []);
        }
      } else {
        // User is logged out, clear all data
        setProfile(null);
        setNotifications([]);
      }
      
      // Set loading to false only after all async operations for the auth state are complete
      setLoading(false);
    });

    return () => {
      // Cleanup the listener when the component unmounts
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const fetchNotifications = useCallback(async () => {
      if (!user) return;
      const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      setNotifications(data || []);
  }, [user]);

  const refetchProfile = useCallback(async () => {
    // This function is for manual profile refreshes, e.g., after an update
    if (user) {
        setLoading(true);
        const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (error) {
            console.error("Refetch profile error", error);
        } else {
            setProfile(profileData as Profile);
        }
        // Also refetch notifications as part of a full profile refresh
        await fetchNotifications();
        setLoading(false);
    }
  }, [user, fetchNotifications]);


  const value = { 
      user, 
      profile,
      notifications,
      isAdmin: profile?.role === 'admin',
      loading,
      refetchProfile,
      fetchNotifications,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



