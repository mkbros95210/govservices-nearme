

import React from 'react';
import { Service } from '../types';
import IconMap from './IconMap';

const ServiceItem: React.FC<{ service: Service; onClick: () => void }> = ({ service, onClick }) => {
  // Simple hash function for pseudo-random colors
  const hashCode = (num: number) => {
    let hash = 0;
    const str = String(num);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const colorClasses = [
    { bg: 'bg-cyan-100', text: 'text-cyan-600' },
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600' },
    { bg: 'bg-red-100', text: 'text-red-600' },
    { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
  ];

  const { bg, text } = colorClasses[Math.abs(hashCode(service.id)) % colorClasses.length];

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 hover:border-cyan-400 cursor-pointer transition-all duration-300 ease-in-out shadow-sm hover:shadow-xl hover:-translate-y-1 text-center"
    >
      {service.is_bookable && service.price != null && (
        <div className="absolute top-2 right-2 bg-emerald-400 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow">
          {service.price === 0 ? 'FREE' : `₹${service.price}`}
        </div>
      )}
      <div className={`flex items-center justify-center w-20 h-20 rounded-full ${bg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
        <div className={text}>
            <IconMap iconName={service.icon_name} className="h-12 w-12" />
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-700 tracking-tight">{service.name}</span>
    </div>
  );
};

export default ServiceItem;