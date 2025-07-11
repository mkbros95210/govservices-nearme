import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { Notification } from '../types';


const { Link, useNavigate } = ReactRouterDOM as any;

const NotificationPanel: React.FC<{
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: number | 'all') => void;
}> = ({ notifications, onClose, onMarkAsRead }) => {
    
    return (
        <div 
          className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden z-50 animate-fade-in"
        >
            <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Notifications</h3>
                {notifications.some(n => !n.is_read) && (
                    <button onClick={() => onMarkAsRead('all')} className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
                        Mark all as read
                    </button>
                )}
            </div>
            {notifications.length > 0 ? (
                <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.map(n => (
                        <li key={n.id} onClick={() => onMarkAsRead(n.id)}>
                            <Link to={n.link} className={`block p-4 transition-colors ${n.is_read ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50' : 'bg-cyan-50 dark:bg-cyan-900/30 font-semibold'}`}>
                                <p className="text-sm text-slate-700 dark:text-slate-200">{n.message}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    <p>You have no notifications.</p>
                </div>
            )}
        </div>
    );
};


const Header: React.FC = () => {
  const { user, isAdmin, loading, notifications, fetchNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: number | 'all') => {
      const allUnreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

      try {
          if (id === 'all') {
              if(allUnreadIds.length === 0) return;
              await supabase.from('notifications').update({ is_read: true }).in('id', allUnreadIds);
          } else {
              await supabase.from('notifications').update({ is_read: true }).eq('id', id);
          }
          fetchNotifications(); // Refetch notifications
      } catch (error) {
          console.error("Failed to mark notification as read", error);
      }
      setNotificationOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link to="/" className="flex items-center gap-2">
           <span className="font-bold text-2xl text-slate-800 dark:text-slate-200">near</span>
           <span className="font-bold text-2xl text-cyan-500">me.</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            <div className="relative w-6 h-6">
              <svg xmlns="http://www.w3.org/2000/svg" className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300 transform ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className={`absolute inset-0 w-6 h-6 text-cyan-400 transition-all duration-300 transform ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </button>
          
          {loading ? (
             <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg"></div>
          ) : user ? (
            <>
              {isAdmin && (
                 <Link to="/admin" className="hidden sm:inline-block px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/80 transition-colors rounded-lg">
                    Admin
                 </Link>
              )}
              
               <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setNotificationOpen(prev => !prev)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle notifications"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {unreadCount > 0 && (
                            <div className="absolute top-0 right-0 -mt-1 -mr-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                {unreadCount}
                            </div>
                        )}
                    </button>
                    {isNotificationOpen && <NotificationPanel notifications={notifications} onClose={() => setNotificationOpen(false)} onMarkAsRead={handleMarkAsRead} />}
                </div>

              <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-transform transform hover:scale-110" aria-label="View Profile">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors rounded-lg shadow-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
