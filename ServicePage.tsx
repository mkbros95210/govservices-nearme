
import React, { useContext, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getBreadcrumbs, findServiceById } from './serviceHelper';
import Breadcrumb from './components/Breadcrumb';
import IconMap from './components/IconMap';
import { Service } from './types';
import { ServiceContext } from './context/ServiceContext';

const { useParams, useNavigate, Link } = ReactRouterDOM as any;

const ServicePage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { allServices, loading } = useContext(ServiceContext);
  
  const serviceId = Number(params.serviceId);

  const { service, breadcrumbs } = useMemo(() => {
    if (loading || !serviceId) return { service: null, breadcrumbs: [] };
    const foundService = findServiceById(allServices, serviceId);
    const crumbs = getBreadcrumbs(allServices, serviceId);
    return { service: foundService, breadcrumbs: crumbs };
  }, [allServices, serviceId, loading]);

  const handleSubServiceClick = (subService: Service) => {
    if (subService.is_bookable) {
      navigate(`/booking/${subService.id}`);
    } else {
      navigate(`/service/${subService.id}`);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-semibold">Loading service details...</p>
        </div>
     );
  }

  if (!service) {
    return (
      <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-500/30 animate-fade-in">
        <IconMap iconName="DefaultIcon" className="h-20 w-20 mx-auto text-red-400" />
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-6">Service Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">The service you are looking for does not exist or may have been moved.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 px-8 py-3 text-base font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-xl hover:bg-cyan-600 transition-all duration-300 transform hover:-translate-y-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Services
        </Link>
      </div>
    );
  }

  const hasSubServices = service.subServices && service.subServices.length > 0;

  return (
    <div>
      <Breadcrumb crumbs={breadcrumbs} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Panel: Parent Service Info */}
        <aside className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-28 animate-slide-in-left">
                <div className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/70 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/50 dark:border-slate-700/50">
                    <div className="relative mb-4">
                        <div className="absolute -top-12 -left-2 w-28 h-28 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-xl border-4 border-slate-50 dark:border-slate-800/80">
                            <IconMap iconName={service.icon_name} className="h-16 w-16" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight pt-16">{service.name}</h1>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
                      {service.description || "The parent category for the services listed here."}
                    </p>

                    {service.is_bookable && (
                        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Direct Booking Available</h3>
                            <button 
                                onClick={() => navigate(`/booking/${service.id}`)}
                                className="mt-3 w-full px-8 py-4 text-lg font-bold text-white bg-cyan-500 rounded-xl shadow-lg hover:shadow-cyan-500/40 hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Book Now
                                {service.price != null && (
                                    <span className="bg-cyan-700/80 text-white text-sm font-bold px-3 py-1 rounded-full">
                                        {service.price === 0 ? 'FREE' : `₹${service.price}`}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>

        {/* Right Panel: Sub-Services */}
        <div className="lg:col-span-8 xl:col-span-9">
            {hasSubServices ? (
                <>
                    <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-6 tracking-tight">
                        {service.is_bookable ? 'Or, Choose a Specific Service' : `Services under ${service.name}`}
                    </h2>
                    <div className="flex flex-col gap-5">
                        {service.subServices?.map((sub, index) => (
                            <div
                                key={sub.id}
                                onClick={() => handleSubServiceClick(sub)}
                                style={{ animationDelay: `${100 * index}ms`, opacity: 0 }}
                                className="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-transparent hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer transform hover:scale-[1.02] transition-all duration-300 ease-in-out flex items-center gap-5 animate-list-item-in"
                            >
                                <div className="flex-shrink-0 text-cyan-500 bg-cyan-100 dark:bg-cyan-900/50 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    <IconMap iconName={sub.icon_name} className="h-10 w-10" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{sub.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 truncate">{sub.description || 'Proceed to the next step.'}</p>
                                </div>
                                <div className="flex-shrink-0 ml-auto flex items-center gap-4">
                                     {sub.is_bookable && sub.price != null && (
                                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                            {sub.price === 0 ? 'FREE' : `₹${sub.price}`}
                                        </div>
                                    )}
                                    {sub.is_bookable ? (
                                        <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-cyan-500 rounded-lg shadow-md group-hover:bg-cyan-600 group-hover:shadow-lg transition-all duration-300 whitespace-nowrap">
                                            Book Now
                                        </span>
                                    ) : (
                                        <div className="text-cyan-500 transition-transform group-hover:translate-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center p-10 lg:p-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-fade-in">
                    <IconMap iconName="DefaultIcon" className="h-16 w-16 mx-auto text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6">No Further Services</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">There are no specific sub-services under this category. You can either book this service directly (if available) or explore other main categories.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
