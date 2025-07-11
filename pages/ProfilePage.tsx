


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Booking, UserMessage } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

type ActiveTab = 'bookings' | 'edit' | 'settings';

const STATUS_ORDER = ['Submitted', 'In Review', 'Requires Action', 'Approved', 'Completed'];
const BOOKING_STATUSES_MAPPED = {
  'Pending': 'Submitted',
  'In Review': 'In Review',
  'Requires Action': 'Requires Action',
  'Approved': 'Approved',
  'Rejected': 'Rejected', // This is a final state, not on the main track.
  'Completed': 'Completed'
};

const ProfilePage: React.FC = () => {
    const { user, profile, loading: authLoading, refetchProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<ActiveTab>('bookings');

    if (authLoading) {
        return (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">My Profile</h1>
                <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Manage your personal information and application history.</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl flex items-center gap-2 max-w-md mx-auto sm:mx-0">
                <TabButton name="My Bookings" tab="bookings" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton name="Edit Profile" tab="edit" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton name="Settings" tab="settings" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Content Panel */}
            <div key={activeTab} className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 animate-fade-in overflow-hidden">
                {activeTab === 'bookings' && <BookingsPanel />}
                {activeTab === 'edit' && <EditProfilePanel profile={profile} user={user} refetchProfile={refetchProfile} />}
                {activeTab === 'settings' && <SettingsPanel onLogout={() => supabase.auth.signOut().then(() => navigate('/'))} />}
            </div>
        </div>
    );
};

// --- Child Components for Tabs ---

const TabButton: React.FC<{name: string, tab: ActiveTab, activeTab: ActiveTab, setActiveTab: (tab: ActiveTab) => void}> = 
({ name, tab, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(tab)}
        className={`flex-1 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${
            activeTab === tab ? 'bg-cyan-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
        }`}
    >
        {name}
    </button>
);

const StatusTracker: React.FC<{ currentStatus: string }> = ({ currentStatus }) => {
    const mappedStatus = BOOKING_STATUSES_MAPPED[currentStatus as keyof typeof BOOKING_STATUSES_MAPPED] || 'Submitted';
    const currentIndex = STATUS_ORDER.indexOf(mappedStatus);

    if (currentStatus === 'Rejected') {
        return (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                 <p className="font-bold text-red-700 dark:text-red-200">Application Rejected</p>
            </div>
        )
    }

    return (
        <div className="flex items-center w-full">
            {STATUS_ORDER.map((status, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isWarning = status === 'Requires Action' && isCurrent;

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isActive 
                                ? (isWarning ? 'bg-orange-400 border-orange-500' : 'bg-cyan-500 border-cyan-600') 
                                : 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500'
                            }`}>
                               {isActive && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            <p className={`mt-2 text-xs text-center font-semibold transition-colors ${
                                isActive ? (isWarning ? 'text-orange-500' : 'text-cyan-600 dark:text-cyan-400') : 'text-slate-400'
                            }`}>{status}</p>
                        </div>
                        {index < STATUS_ORDER.length - 1 && (
                            <div className={`flex-1 h-1 transition-colors duration-500 mx-2 ${
                                index < currentIndex ? (isWarning ? 'bg-orange-400' : 'bg-cyan-500') : 'bg-slate-200 dark:bg-slate-600'
                            }`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

interface ProfileBooking {
    id: number;
    created_at: string;
    status: string;
    user_messages: UserMessage[] | null;
    services: { name: string } | null;
}

const BookingsPanel = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<ProfileBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('id, created_at, status, user_messages, services(name)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setBookings(data as ProfileBooking[]);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user]);

    if (loading) return <p className="p-8 text-center text-slate-500 dark:text-slate-400">Loading your bookings...</p>;

    return (
        <div className="space-y-6">
             {bookings.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">You haven't made any bookings yet.</div>
             ) : (
                bookings.map(booking => (
                    <div key={booking.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{booking.services?.name || 'Unknown Service'}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Submitted on {new Date(booking.created_at).toLocaleDateString()}
                                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                    ID: <span className="font-mono">NME-{String(booking.id).padStart(6, '0')}</span>
                                </p>
                            </div>
                             {booking.status === 'Requires Action' && (
                                <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200 text-sm font-semibold px-4 py-2 rounded-lg">
                                    Action Required
                                </div>
                             )}
                        </div>
                        
                        <StatusTracker currentStatus={booking.status} />

                        {(booking.user_messages || []).length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 mb-2">Latest Message from Admin:</h4>
                                <div className="p-3 rounded-lg bg-cyan-100 text-cyan-900 dark:bg-cyan-900/50 dark:text-cyan-200">
                                    <p className="text-sm whitespace-pre-wrap">{[...booking.user_messages].pop()?.text}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))
             )}
        </div>
    );
};

const EditProfilePanel: React.FC<{ profile: any, user: any, refetchProfile: () => Promise<void> }> = ({ profile, user, refetchProfile }) => {
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [dob, setDob] = useState(profile?.dob || '');
    const [mobile, setMobile] = useState(profile?.mobile_number || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.from('profiles').update({
                full_name: fullName, dob, mobile_number: mobile,
            }).eq('id', user.id);
            if (error) throw error;
            await refetchProfile();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Full Name</label>
                    <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition dark:text-white" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Email Address</label>
                    <input type="email" id="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg cursor-not-allowed dark:text-slate-400" />
                </div>
                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Date of Birth</label>
                    <input type="date" id="dob" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition dark:text-white" />
                </div>
                <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Mobile Number</label>
                    <input type="tel" id="mobile" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition dark:text-white" />
                </div>
            </div>
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                 {message.text && <p className={`text-sm font-medium flex-1 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>}
                <button type="submit" disabled={loading} className="px-8 py-2.5 font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition disabled:bg-slate-400 dark:disabled:bg-slate-600 shadow hover:shadow-lg">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const SettingsPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Account Actions</h3>
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-red-400/50 dark:border-red-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                 <h4 className="font-bold text-slate-800 dark:text-slate-200">Logout</h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This will end your current session.</p>
            </div>
            <button onClick={onLogout} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-red-600 bg-red-100/80 hover:bg-red-200/80 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                Logout Now
            </button>
        </div>
    </div>
);


export default ProfilePage;
