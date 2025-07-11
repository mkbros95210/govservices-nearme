import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { AppSettings } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';

const AdminSettingsPage: React.FC = () => {
  const { settings, refetchServices } = useContext(ServiceContext);
  const [homepageLimit, setHomepageLimit] = useState(settings.homepage_service_limit);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setHomepageLimit(settings.homepage_service_limit);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const newSettings: AppSettings = {
      homepage_service_limit: Number(homepageLimit)
    };

    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: newSettings })
        .eq('key', 'app_settings');

      if (error) {
        // If update fails, maybe the row doesn't exist. Try to insert it.
        const { error: insertError } = await supabase
            .from('settings')
            .insert({ key: 'app_settings', value: newSettings });
        if(insertError) throw insertError;
      }
      
      setMessage('Settings saved successfully!');
      refetchServices(); // Re-fetch to update context
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Application Settings</h1>
      
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Homepage</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Control what appears on the main landing page.</p>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <label htmlFor="homepageLimit" className="block text-base font-semibold text-slate-700 dark:text-slate-300">
            Featured Services Limit
          </label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Set the maximum number of "featured" services to show on the homepage.
          </p>
          <input
            id="homepageLimit"
            type="number"
            value={homepageLimit}
            onChange={(e) => setHomepageLimit(Number(e.target.value))}
            min="1"
            className="w-full max-w-xs p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 transition"
          />
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
            {message && <p className="text-sm font-medium text-green-600 dark:text-green-400 flex-1">{message}</p>}
            <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:bg-cyan-600 disabled:bg-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all"
            >
                {loading ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
