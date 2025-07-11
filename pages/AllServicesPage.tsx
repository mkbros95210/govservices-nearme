import React, { useContext } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ServiceItem from '../components/ServiceItem';
import { Service } from '../types';
import { ServiceContext } from '../context/ServiceContext';

const { useNavigate } = ReactRouterDOM as any;

const AllServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { allServices, loading } = useContext(ServiceContext);

  const handleServiceClick = (service: Service) => {
    // If it has bookable process, go to booking page.
    // Otherwise, it's a category, so navigate to the service page to show its sub-services.
    if (service.is_bookable) {
      navigate(`/booking/${service.id}`);
    } else {
      navigate(`/service/${service.id}`);
    }
  };

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">All Services</h1>
            <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Browse our complete catalog of available government services.
            </p>
        </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {allServices.map((service) => (
            <ServiceItem 
                key={service.id} 
                service={service} 
                onClick={() => handleServiceClick(service)} 
            />
            ))}
        </div>
      )}
    </div>
  );
};

export default AllServicesPage;