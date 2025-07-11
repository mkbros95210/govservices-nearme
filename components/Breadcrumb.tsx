
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Service } from '../types';

const { Link } = ReactRouterDOM as any;

interface BreadcrumbProps {
  crumbs: Service[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ crumbs }) => {
  return (
    <nav className="flex items-center text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center font-medium text-slate-500 hover:text-cyan-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Services
          </Link>
        </li>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          
          return (
            <li key={crumb.id}>
              <div className="flex items-center">
                <svg className="rtl:rotate-180 w-3 h-3 text-slate-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                {isLast ? (
                   <span className="ms-1 font-semibold text-slate-800 md:ms-2">{crumb.name}</span>
                ) : (
                  <Link to={`/service/${crumb.id}`} className="ms-1 font-medium text-slate-500 hover:text-cyan-600 md:ms-2 transition-colors">{crumb.name}</Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;