
import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../supabaseClient';
import { PromoBannerSlide } from '../../types';
import { ServiceContext } from '../../context/ServiceContext';

// --- FormModal Component ---
const BannerFormModal: React.FC<{
    slide: Partial<PromoBannerSlide> | null;
    onClose: () => void;
    onSave: () => void;
}> = ({ slide, onClose, onSave }) => {
    const [formState, setFormState] = useState<Partial<PromoBannerSlide>>({
        title: slide?.title || '',
        subtitle: slide?.subtitle || '',
        code: slide?.code || '',
        is_active: slide?.is_active ?? true,
        display_order: slide?.display_order || 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field: keyof typeof formState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (slide && slide.id) {
                // Editing existing slide
                result = await supabase.from('promo_banners').update(formState).eq('id', slide.id);
            } else {
                // Creating new slide
                result = await supabase.from('promo_banners').insert([formState]);
            }
            if (result.error) throw result.error;
            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{slide ? 'Edit' : 'Add'} Banner Slide</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <input type="text" placeholder="Title" value={formState.title} onChange={e => handleChange('title', e.target.value)} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg" />
                        <input type="text" placeholder="Subtitle" value={formState.subtitle} onChange={e => handleChange('subtitle', e.target.value)} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg" />
                        <input type="text" placeholder="Code / Call to Action" value={formState.code} onChange={e => handleChange('code', e.target.value)} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Display Order" value={formState.display_order} onChange={e => handleChange('display_order', Number(e.target.value))} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg" />
                            <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 border dark:border-slate-600 rounded-lg font-semibold cursor-pointer">
                                <input type="checkbox" checked={formState.is_active} onChange={e => handleChange('is_active', e.target.checked)} className="w-5 h-5 accent-cyan-500"/> 
                                Is Active
                            </label>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 disabled:bg-slate-400 transition">
                            {loading ? 'Saving...' : 'Save Slide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AdminPromoBannerPage: React.FC = () => {
  const [banners, setBanners] = useState<PromoBannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refetchServices } = useContext(ServiceContext);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<PromoBannerSlide | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
        const { data, error } = await supabase
            .from('promo_banners')
            .select('*')
            .order('display_order', { ascending: true });
        if (error) throw error;
        setBanners(data);
    } catch(err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openModal = (banner: PromoBannerSlide | null = null) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  const handleSave = () => {
    fetchBanners();
    refetchServices(); // This updates the live site
    closeModal();
  };

  const handleDelete = async (id: number) => {
      if (window.confirm("Are you sure you want to delete this banner slide?")) {
          const { error } = await supabase.from('promo_banners').delete().eq('id', id);
          if (error) {
            setError(error.message);
          } else {
            handleSave();
          }
      }
  };
  
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Promo Banner</h1>
             <button onClick={() => openModal()} className="px-5 py-2.5 bg-cyan-500 text-white font-bold rounded-lg shadow-md hover:bg-cyan-600 transition">
                Add New Slide
            </button>
        </div>
        
        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? <p className="p-6 text-center">Loading banners...</p> : (
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100/70 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                          <tr>
                              <th className="p-3 font-semibold">Title</th>
                              <th className="p-3 font-semibold hidden sm:table-cell">Subtitle</th>
                              <th className="p-3 font-semibold text-center">Order</th>
                              <th className="p-3 font-semibold text-center">Status</th>
                              <th className="p-3 w-36"></th>
                          </tr>
                      </thead>
                      <tbody>
                        {banners.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-slate-500">No banners created yet.</td></tr>
                        ) : (
                          banners.map(banner => (
                            <tr key={banner.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{banner.title}</td>
                                <td className="p-3 hidden sm:table-cell text-slate-600 dark:text-slate-400">{banner.subtitle}</td>
                                <td className="p-3 text-center text-slate-600 dark:text-slate-400">{banner.display_order}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                                        {banner.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-3 text-right space-x-4">
                                    <button onClick={() => openModal(banner)} className="text-cyan-600 hover:underline font-semibold text-sm">Edit</button>
                                    <button onClick={() => handleDelete(banner.id)} className="text-red-600 hover:underline font-semibold text-sm">Delete</button>
                                </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                  </table>
              )}
            </div>
        </div>

        {isModalOpen && <BannerFormModal slide={selectedBanner} onClose={closeModal} onSave={handleSave} />}
    </div>
  );
};

export default AdminPromoBannerPage;
