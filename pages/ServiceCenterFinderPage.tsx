import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ServiceCenter } from '../types';
import IconMap from '../components/IconMap';

const ServiceCenterFinderPage: React.FC = () => {
    const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                    setError(null);
                    try {
                        const { data, error: rpcError } = await supabase.rpc('find_centers_near', {
                            lat: latitude,
                            long: longitude
                        });

                        if (rpcError) throw rpcError;
                        setCenters(data as ServiceCenter[]);

                    } catch (err: any) {
                        setError("Could not fetch nearby centers. Please try again later.");
                        console.error(err);
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    setError(`Geolocation error: ${error.message}. Please enable location services.`);
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
        }
    }, []);

    const handleGetDirections = (lat: number, lon: number) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Find a Center Near You</h1>
                <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    {loading ? 'Getting your location...' : error || 'Displaying service centers closest to your location.'}
                </p>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            ) : error ? (
                <div className="p-10 text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-2xl">
                    {error}
                </div>
            ) : centers.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* List of Centers */}
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {centers.map((center, index) => (
                            <div 
                                key={center.id} 
                                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-start gap-5 animate-list-item-in"
                                style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
                            >
                                <div className="flex-shrink-0 text-cyan-500 bg-cyan-100 dark:bg-cyan-900/50 p-4 rounded-2xl">
                                    <IconMap iconName={center.services?.icon_name || 'DefaultIcon'} className="h-10 w-10" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{center.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{center.address}</p>
                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mt-2">Provides: {center.services?.name}</p>
                                </div>
                                <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-right space-y-2">
                                    <div className="text-lg font-extrabold text-cyan-500 dark:text-cyan-400">
                                        {center.distance_km?.toFixed(2)} km
                                    </div>
                                    <button 
                                        onClick={() => handleGetDirections(center.latitude, center.longitude)}
                                        className="w-full sm:w-auto px-4 py-2 text-sm font-bold text-white bg-cyan-500 rounded-lg shadow-md hover:bg-cyan-600 transition-all"
                                    >
                                        Get Directions
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Map Placeholder */}
                    <div className="sticky top-28 h-64 lg:h-[70vh] bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                         <div className="text-center text-slate-500 dark:text-slate-400 p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10V7m0 10h-3.829a1 1 0 01-.894-1.447L12 14" /></svg>
                             <p className="mt-2 font-semibold">Map View Coming Soon</p>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="p-10 text-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <p>No service centers found near your location.</p>
                </div>
            )}
        </div>
    );
};

export default ServiceCenterFinderPage;
