
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Service, AppSettings, PromoBannerSlide } from '../types';

interface ServiceContextType {
  allServices: Service[];
  featuredServices: Service[];
  settings: AppSettings;
  promoBanners: PromoBannerSlide[];
  loading: boolean;
  refetchServices: () => void;
}

export const ServiceContext = createContext<ServiceContextType>({
  allServices: [],
  featuredServices: [],
  settings: { homepage_service_limit: 8 },
  promoBanners: [],
  loading: true,
  refetchServices: () => {},
});

const buildServiceTree = (flatServices: Service[] | null): Service[] => {
  if (!flatServices) return [];
  
  const serviceMap = new Map<number, Service>();
  const serviceTree: Service[] = [];

  flatServices.forEach(service => {
    serviceMap.set(service.id, { ...service, subServices: [] });
  });

  serviceMap.forEach(service => {
    if (service.parent_id && serviceMap.has(service.parent_id)) {
      const parent = serviceMap.get(service.parent_id);
      parent?.subServices?.push(service);
    } else {
      serviceTree.push(service);
    }
  });

  return serviceTree;
};


export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ homepage_service_limit: 8 });
  const [promoBanners, setPromoBanners] = useState<PromoBannerSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicesAndSettings = useCallback(async () => {
    setLoading(true);
    try {
       const [servicesRes, settingsRes, bannersRes] = await Promise.all([
            supabase
                .from('services')
                .select('*')
                .order('display_order', { ascending: true })
                .order('name', { ascending: true }),
            supabase
                .from('settings')
                .select('value')
                .eq('key', 'app_settings')
                .single(),
            supabase
                .from('promo_banners')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
       ]);

      if (servicesRes.error) throw servicesRes.error;
      if (settingsRes.error) throw settingsRes.error;
      if (bannersRes.error) throw bannersRes.error;

      // Process Services
      const flatServices = servicesRes.data as Service[];
      const tree = buildServiceTree(flatServices);
      setAllServices(tree);
      
      // Process Settings
      const appSettings = (settingsRes.data?.value as AppSettings) || { homepage_service_limit: 8 };
      setSettings(appSettings);

      const featured = flatServices
        .filter(s => s.is_featured && !s.parent_id)
        .slice(0, appSettings.homepage_service_limit);
      setFeaturedServices(featured);
      
      // Process Banners
      setPromoBanners(bannersRes.data as PromoBannerSlide[]);

    } catch (err: any) {
      console.error('Error fetching services/settings:', err.message || 'An unknown error occurred.');
      setAllServices([]);
      setFeaturedServices([]);
      setPromoBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesAndSettings();
  }, [fetchServicesAndSettings]);

  const value = {
    allServices,
    featuredServices,
    settings,
    promoBanners,
    loading,
    refetchServices: fetchServicesAndSettings,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};
