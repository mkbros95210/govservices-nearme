

import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const StatCard: React.FC<{ title: string; value: number | null; loading: boolean, icon: React.ReactNode, delay: number }> = ({ title, value, loading, icon, delay }) => (
    <div 
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-5 animate-list-item-in"
      style={{ animationDelay: `${delay}ms`}}
    >
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-500 dark:text-cyan-400 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="text-base font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
            {loading ? (
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-md mt-2"></div>
            ) : (
                <p className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{value ?? 'N/A'}</p>
            )}
        </div>
    </div>
);


const BOOKING_STATUSES = ['Pending', 'In Review', 'Requires Action', 'Approved', 'Rejected', 'Completed'];
const STATUS_COLORS: { [key: string]: string } = {
  'Pending': 'bg-yellow-400 dark:bg-yellow-500',
  'In Review': 'bg-blue-400 dark:bg-blue-500',
  'Requires Action': 'bg-orange-400 dark:bg-orange-500',
  'Approved': 'bg-green-400 dark:bg-green-500',
  'Rejected': 'bg-red-400 dark:bg-red-500',
  'Completed': 'bg-purple-400 dark:bg-purple-500',
};


const StatsChart: React.FC<{ bookings: Pick<Booking, 'status'>[], loading: boolean }> = ({ bookings, loading }) => {
    const [statusCounts, setStatusCounts] = useState<{[key: string]: number}>({});
    
    useEffect(() => {
        const counts = BOOKING_STATUSES.reduce((acc, status) => ({...acc, [status]: 0}), {});
        bookings.forEach(b => {
            if (counts[b.status] !== undefined) {
                counts[b.status]++;
            }
        });
        setStatusCounts(counts);
    }, [bookings]);

    const maxCount = Math.max(...Object.values(statusCounts), 1); // Avoid division by zero

    return (
       <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 animate-list-item-in" style={{ animationDelay: '150ms' }}>
           <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Bookings by Status</h3>
            {loading ? (
                <div className="space-y-4">
                    {Array.from({length: 4}).map((_, i) => <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {BOOKING_STATUSES.map((status, index) => (
                        <div key={status} className="flex items-center gap-4 group" style={{ animation: `list-item-in 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}>
                            <div className="w-32 text-sm font-semibold text-slate-600 dark:text-slate-300 truncate">{status}</div>
                            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                                <div 
                                    className={`h-full ${STATUS_COLORS[status]} rounded-full transition-all duration-700 ease-out`}
                                    style={{ width: `${(statusCounts[status] / maxCount) * 100}%`}}
                                >
                                </div>
                            </div>
                            <div className="w-10 text-right font-bold text-slate-800 dark:text-slate-100">{statusCounts[status]}</div>
                        </div>
                    ))}
                </div>
            )}
       </div>
    );
};

interface RecentBooking {
    id: number;
    created_at: string;
    status: string;
    services: { name: string; } | null;
    profiles: { full_name: string | null; } | null;
}

const RecentBookings: React.FC = () => {
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('id, created_at, status, services(name), profiles(full_name)')
                    .order('created_at', { ascending: false })
                    .limit(5)
                    .returns<RecentBooking[]>();
                if (error) throw error;
                setRecentBookings(data || []);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchRecent();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-list-item-in" style={{ animationDelay: '200ms' }}>
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 p-6">Recent Bookings</h3>
            <div className="overflow-x-auto">
                 <div className="w-full text-left text-sm">
                        {loading ? (
                             Array.from({length: 5}).map((_, i) => (
                                <div key={i} className="border-t border-slate-100 dark:border-slate-700/50 p-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div></div>
                            ))
                        ) : recentBookings.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 dark:text-slate-400">No bookings yet.</div>
                        ) : (
                            recentBookings.map((booking, index) => (
                                <Link to="/admin/bookings" key={booking.id} className="flex justify-between items-center p-4 border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" style={{ animation: `list-item-in 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}>
                                    <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-100">{booking.profiles?.full_name || 'N/A'}</div>
                                        <div className="text-slate-500 dark:text-slate-400">{booking.services?.name || 'Unknown'}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[booking.status] || 'bg-slate-400'} text-white`}>{booking.status}</span>
                                        <div className="text-xs text-slate-400 mt-1">{new Date(booking.created_at).toLocaleDateString()}</div>
                                    </div>
                                </Link>
                            ))
                        )}
                 </div>
            </div>
             <div className="p-4 text-center bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                <Link to="/admin/bookings" className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">View All Bookings</Link>
            </div>
        </div>
    );
};


const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ services: 0, users: 0 });
  const [allBookings, setAllBookings] = useState<Pick<Booking, 'id' | 'status'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          { count: servicesCount, error: sErr },
          { data: bookingsData, error: bErr },
          { count: usersCount, error: uErr }
        ] = await Promise.all([
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('bookings').select('id, status'), // Fetch all for chart
          supabase.from('profiles').select('*', { count: 'exact', head: true })
        ]);

        if (sErr || bErr || uErr) {
            console.error(sErr || bErr || uErr);
            throw new Error('Failed to fetch stats');
        }

        setStats({
          services: servicesCount ?? 0,
          users: usersCount ?? 0,
        });
        setAllBookings(bookingsData as Pick<Booking, 'id' | 'status'>[]);

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard delay={0} title="Total Services" value={stats.services} loading={loading} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
            <StatCard delay={50} title="Total Bookings" value={allBookings.length} loading={loading} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} />
            <StatCard delay={100} title="Registered Users" value={stats.users} loading={loading} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /></svg>} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
             <div className="lg:col-span-3">
                <StatsChart bookings={allBookings} loading={loading} />
             </div>
             <div className="lg:col-span-2">
                <RecentBookings />
             </div>
        </div>
    </div>
  );
};

export default AdminDashboardPage;