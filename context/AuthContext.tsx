useEffect(() => {
  setLoading(true);

  const getInitialSession = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Error getting initial session:', sessionError);
    }

    const sessionUser = session?.user ?? null;
    setUser(sessionUser);

    if (sessionUser) {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        setProfile(null);
        setNotifications([]);
      } else {
        setProfile(profileData as Profile);

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', sessionUser.id)
          .order('created_at', { ascending: false });

        setNotifications(notificationsData || []);
      }
    } else {
      setProfile(null);
      setNotifications([]);
    }

    setLoading(false);
  };

  // Run session fetch on first load
  getInitialSession();

  // Subscribe to auth changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching profile (onAuthChange):', profileError);
          setProfile(null);
          setNotifications([]);
        } else {
          setProfile(profileData as Profile);

          const { data: notificationsData } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false });

          setNotifications(notificationsData || []);
        }
      } else {
        setProfile(null);
        setNotifications([]);
      }
    }
  );

  return () => {
    authListener?.subscription.unsubscribe();
  };
}, []);





