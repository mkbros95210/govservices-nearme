


import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking, UploadedFileRecord, AdminNote, UserMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';


const BOOKING_STATUSES = ['Pending', 'In Review', 'Requires Action', 'Approved', 'Rejected', 'Completed'];

const BookingDetailPanel: React.FC<{
    bookingId: number;
    onClose: () => void;
    onUpdate: () => void;
}> = ({ bookingId, onClose, onUpdate }) => {
    const { profile: adminProfile } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newStatus, setNewStatus] = useState('');
    const [messageToUser, setMessageToUser] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchBookingDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*, services(name), profiles(full_name, email)')
                .eq('id', bookingId)
                .single();
            if (error) throw error;
            setBooking(data as Booking);
            setNewStatus(data.status);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [bookingId]);

    useEffect(() => {
        fetchBookingDetails();
    }, [fetchBookingDetails]);

    const handleSave = async () => {
        if (!booking) return;
        setIsSaving(true);
        
        const updatedMessages: UserMessage[] = [...(booking.user_messages || [])];
        if (messageToUser.trim()) {
            updatedMessages.push({
                sender: 'admin',
                text: messageToUser.trim(),
                timestamp: new Date().toISOString(),
            });
        }
        
        const updatedNotes: AdminNote[] = [...(booking.admin_notes || [])];
        if (adminNote.trim()) {
            updatedNotes.push({
                text: adminNote.trim(),
                timestamp: new Date().toISOString(),
                admin_name: adminProfile?.full_name || 'Admin',
            });
        }

        try {
            // 1. Update the booking
            const { error: updateError } = await supabase.from('bookings').update({
                status: newStatus,
                user_messages: updatedMessages,
                admin_notes: updatedNotes,
            }).eq('id', booking.id);

            if (updateError) throw updateError;

            // 2. Create a notification if the status has changed
            if (newStatus !== booking.status) {
                const notifMessage = `Your booking for "${booking.services?.name}" has been updated to: ${newStatus}.`;
                const { error: notifError } = await supabase.from('notifications').insert({
                    user_id: booking.user_id,
                    message: notifMessage,
                    link: '/profile'
                });
                if (notifError) {
                    console.warn("Failed to create notification:", notifError);
                }
            }

            setMessageToUser('');
            setAdminNote('');
            onUpdate(); // Re-fetches list on main page
            fetchBookingDetails(); // Re-fetches details in panel
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const DetailSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
        <div className="py-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
    const DetailItem: React.FC<{label: string; children: React.ReactNode}> = ({ label, children }) => (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-base font-medium text-slate-800">{children}</p>
        </div>
    );

    return (
       <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
            <div 
                className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-slate-50 shadow-2xl flex flex-col animate-slide-in-right"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Booking Details</h2>
                        <p className="font-mono text-sm text-slate-500">NME-{String(bookingId).padStart(6, '0')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {booking && (
                        <div className="divide-y divide-slate-200">
                             <DetailSection title="Applicant & Service">
                                <DetailItem label="Applicant">{booking.profiles?.full_name}</DetailItem>
                                <DetailItem label="Email">{booking.profiles?.email}</DetailItem>
                                <DetailItem label="Service">{booking.services?.name}</DetailItem>
                                <DetailItem label="Submitted On">{new Date(booking.created_at).toLocaleString()}</DetailItem>
                            </DetailSection>

                            <DetailSection title="Applicant Provided Details">
                                {booking.user_details && Object.entries(booking.user_details).map(([key, value]) => {
                                    if(key === 'customFields') return null; // handle this separately if needed
                                    return <DetailItem key={key} label={key.replace(/([A-Z])/g, ' $1')}>{String(value)}</DetailItem>
                                })}
                            </DetailSection>

                            <DetailSection title="Uploaded Documents">
                                {booking.uploaded_files && Object.values(booking.uploaded_files).map(file => {
                                    const { data } = supabase.storage.from('documents').getPublicUrl(file.path);
                                    return (
                                        <a href={data.publicUrl} target="_blank" rel="noopener noreferrer" key={file.path} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-cyan-50 hover:border-cyan-400 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                            <span className="font-semibold text-cyan-700">{file.name}</span>
                                            <span className="text-xs text-slate-500 ml-auto">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </a>
                                    );
                                })}
                            </DetailSection>
                            
                             <DetailSection title="Communication History">
                                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-white rounded-md">
                                    {(booking.user_messages || []).map((msg, i) => (
                                        <div key={i} className={`p-2 rounded-lg ${msg.sender === 'admin' ? 'bg-cyan-100 text-cyan-900' : 'bg-slate-200'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className="text-xs text-slate-500 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    ))}
                                    {(booking.user_messages || []).length === 0 && <p className="text-sm text-slate-400">No messages yet.</p>}
                                </div>
                             </DetailSection>
                        </div>
                    )}
                </main>

                {/* Footer / Actions */}
                <footer className="p-6 bg-white border-t border-slate-200 space-y-4 flex-shrink-0">
                    <h3 className="font-bold text-lg">Admin Actions</h3>
                    <div>
                        <label className="text-sm font-semibold">Update Status</label>
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full mt-1 p-2 border rounded-lg">
                            {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Message to User (optional)</label>
                        <textarea value={messageToUser} onChange={e => setMessageToUser(e.target.value)} placeholder="e.g., Please re-upload your proof of address." className="w-full mt-1 p-2 border rounded-lg min-h-[60px]"></textarea>
                    </div>
                     <div>
                        <label className="text-sm font-semibold">Internal Admin Note (optional)</label>
                        <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Internal note, not visible to user." className="w-full mt-1 p-2 border rounded-lg min-h-[60px]"></textarea>
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className="w-full px-5 py-3 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </footer>
            </div>
       </div>
    );
};

interface BookingRow {
    id: number;
    created_at: string;
    status: string;
    services: { name: string }[] | null;
    profiles: { full_name: string | null; email: string | null }[] | null;
}

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            created_at,
            status,
            user_id,
            services ( name ),
            profiles ( full_name, email )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data as any[]); // Cast to any to handle Supabase nested returns
      } catch (err: any) {
        setError(`Failed to load bookings: ${err.message}`);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  const handleUpdate = () => {
      fetchBookings(); // Refetch the list to show updated status
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">All Bookings</h1>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-x-auto">
        {loading ? (
            <p className="p-6 text-center">Loading bookings...</p>
        ) : (
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-100/70 text-slate-600">
                    <tr>
                        <th className="p-4 font-semibold">Booking ID</th>
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Service</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500">No bookings found.</td>
                        </tr>
                    ) : (
                        bookings.map(booking => (
                            <tr key={booking.id} className="border-b hover:bg-slate-50">
                                <td className="p-4 font-mono text-slate-500">NME-{String(booking.id).padStart(6, '0')}</td>
                                <td className="p-4">
                                    <div className="font-semibold text-slate-800">{booking.profiles?.[0]?.full_name || 'N/A'}</div>
                                    <div className="text-slate-500">{booking.profiles?.[0]?.email || 'No Email'}</div>
                                </td>
                                <td className="p-4 font-medium text-slate-700">{booking.services?.[0]?.name || 'Unknown Service'}</td>
                                <td className="p-4 text-slate-600">{new Date(booking.created_at).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 text-xs font-semibold text-cyan-800 bg-cyan-100 rounded-full">{booking.status}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => setSelectedBookingId(booking.id)} className="text-cyan-600 hover:underline font-semibold">View</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        )}
      </div>
      {selectedBookingId && <BookingDetailPanel bookingId={selectedBookingId} onClose={() => setSelectedBookingId(null)} onUpdate={handleUpdate} />}
    </div>
  );
};

export default AdminBookingsPage;
