

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { NavLink, Outlet } = ReactRouterDOM as any;

// --- ICONS ---
const DashboardIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 4.5a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15z" /><path d="M4.5 10.5a.75.75 0 00-1.5 0v9a.75.75 0 001.5 0v-9z" /><path d="M16.5 7.5a.75.75 0 00-1.5 0v12a.75.75 0 001.5 0v-12z" /></svg>;
const ServicesIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM12.75 17.25a.75.75 0 000-1.5H8.25a.75.75 0 000 1.5h4.5zM12 14.25a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75zM8.25 10.5a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5H8.25z" /></svg>;
const PromoIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.75 2.25a.75.75 0 00.187 1.35l3.822 1.274a.75.75 0 00.86-.334l.215-.43a.75.75 0 00-.93-.93l-.43.215a.75.75 0 00-.333.86l-1.275-3.823a.75.75 0 00-1.35-.187zM11.603 4.23a.75.75 0 00-1.012-.246l-2.618 1.488a.75.75 0 000 1.32l2.618 1.488a.75.75 0 001.012-.246l1.246-2.18a.75.75 0 000-1.072l-1.246-2.18zM6.9 8.925a.75.75 0 00-1.35.187l-1.275 3.823a.75.75 0 00.86.86l.215-.43a.75.75 0 00-.93-.93l.43.215a.75.75 0 00.86-.334l3.823-1.274a.75.75 0 00-.187-1.35L6.9 8.925z" /><path d="M6.082 17.925a3 3 0 104.243 4.243 3 3 0 00-4.243-4.243zM8.197 18.26a.75.75 0 011.06 0l.707.707a.75.75 0 010 1.06l-.707.707a.75.75 0 01-1.06 0l-.707-.707a.75.75 0 010-1.06l.707-.707z" /></svg>;
const BookingsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M3.75 4.5a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v15a.75.75 0 01-.75-.75h-15a.75.75 0 01-.75-.75V4.5zM8.25 6a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H8.25zM8.25 10.5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H8.25zM8.25 15a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H8.25z" clipRule="evenodd" /></svg>;
const SettingsIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 00.92 1.83l.84.42a1.5 1.5 0 001.83-.92l.18-1.03a1.5 1.5 0 00-1.49-1.88l-1.03.18a.75.75 0 01-.62.36v-.38a.75.75 0 01.62-.36l.38.21a.75.75 0 00.92-.18l.84-.84a.75.75 0 00.18-.92l-.21-.38a.75.75 0 00-.36-.62l-1.03.18a1.5 1.5 0 00-1.88-1.49l.18-1.03A1.875 1.875 0 0011.078 2.25zM12.922 2.25c.917 0 1.699.663 1.85 1.567L14.95 5.85a1.5 1.5 0 01-.92 1.83l-.84.42a1.5 1.5 0 01-1.83-.92l-.18-1.03a1.5 1.5 0 011.49-1.88l1.03.18a.75.75 0 00.62.36v-.38a.75.75 0 00-.62-.36l-.38.21a.75.75 0 01-.92-.18l-.84-.84a.75.75 0 01-.18-.92l.21-.38a.75.75 0 01.36-.62l1.03.18a1.5 1.5 0 011.88-1.49l-.18-1.03A1.875 1.875 0 0112.922 2.25zM21 11.078c0 .917-.663 1.699-1.567 1.85l-2.03.18a1.5 1.5 0 00-1.83.92l-.42.84a1.5 1.5 0 00.92 1.83l1.03.18a1.5 1.5 0 001.88-1.49l-.18 1.03c.24 1.35.36 2.7.36 4.05v.38c0 .414-.336.75-.75.75h-.38c-1.35 0-2.7-.12-4.05-.36l-1.03.18a1.5 1.5 0 01-1.49-1.88l.18-1.03a1.5 1.5 0 01.92-1.83l.84-.42a1.5 1.5 0 01.92-1.83l-.84-.84a.75.75 0 00-.92.18l-.38-.21a.75.75 0 00-.36.62l.18 1.03a1.5 1.5 0 01-1.88 1.49l-1.03-.18a1.5 1.5 0 00-1.83.92l-.42-.84a1.5 1.5 0 00-1.83-.92l-1.03-.18a.75.75 0 01-.62-.36v.38a.75.75 0 01.62.36l.38-.21a.75.75 0 01.92.18l.84.84a.75.75 0 01.18.92l-.21.38a.75.75 0 01-.36.62l-1.03-.18a1.5 1.5 0 00-1.88 1.49l-.18-1.03A1.875 1.875 0 012.25 12.922v-1.844c0-.917.663-1.699 1.567-1.85l2.03-.18a1.5 1.5 0 001.83-.92l.42-.84a1.5 1.5 0 00-.92-1.83l-1.03-.18a1.5 1.5 0 00-1.88 1.49l.18-1.03A1.875 1.875 0 013 7.078V6.69c0-.414.336-.75.75-.75h.38c1.35 0 2.7.12 4.05.36l1.03-.18a1.5 1.5 0 011.49 1.88l-.18 1.03a1.5 1.5 0 01-.92 1.83l-.84.42a1.5 1.5 0 01-.92 1.83l.84.84a.75.75 0 00.92-.18l.38.21a.75.75 0 00.36-.62l-.18-1.03a1.5 1.5 0 011.88-1.49l1.03.18a1.5 1.5 0 001.83-.92l.42.84a1.5 1.5 0 001.83.92l1.03.18a.75.75 0 01.62.36v-.38a.75.75 0 01-.62-.36l-.38-.21a.75.75 0 01-.92-.18l-.84-.84a.75.75 0 01-.18-.92l.21-.38a.75.75 0 01.36-.62l1.03.18a1.5 1.5 0 001.88-1.49l.18 1.03A1.875 1.875 0 0121 11.078z" clipRule="evenodd" /></svg>;

const navItems = [
  { name: 'Dashboard', href: '/admin', end: true, icon: DashboardIcon },
  { name: 'Services', href: '/admin/services', end: false, icon: ServicesIcon },
  { name: 'Promo Banner', href: '/admin/promo-banner', end: false, icon: PromoIcon },
  { name: 'Bookings', href: '/admin/bookings', end: false, icon: BookingsIcon },
  { name: 'Settings', href: '/admin/settings', end: false, icon: SettingsIcon },
];

const AdminLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
      {/* Sidebar */}
      <aside className="md:w-64 flex-shrink-0">
        <div className="sticky top-28 bg-white dark:bg-slate-800/50 p-4 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 px-2 uppercase tracking-wider">Admin Menu</h2>
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-base font-bold transition-all duration-200 ease-in-out transform hover:translate-x-1 ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                      : 'text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`
                }
              >
                <item.icon className="h-6 w-6" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;