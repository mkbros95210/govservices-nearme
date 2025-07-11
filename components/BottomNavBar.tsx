import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { NavLink, useLocation } = ReactRouterDOM as any;

const BottomNavBar: React.FC = () => {
  const { user, loading } = useAuth(); // ✅ ADDED loading
  const location = useLocation();

  if (loading) return null; // ✅ ADDED loading check

  const getFilteredNavItems = () => {
    if (user) {
        return [
           { name: 'Home', href: '/', icon: HomeIcon },
           { name: 'Services', href: '/services', icon: ServicesIcon },
           { name: 'Centers', href: '/centers', icon: LocationMarkerIcon },
           { name: 'Profile', href: '/profile', icon: ProfileIcon },
        ]
    }
    return [
       { name: 'Home', href: '/', icon: HomeIcon },
       { name: 'Services', href: '/services', icon: ServicesIcon },
       { name: 'Centers', href: '/centers', icon: LocationMarkerIcon },
       { name: 'Login', href: '/login', icon: LoginIcon },
    ];
  };

  const currentNavItems = getFilteredNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden z-40">
      <div className="max-w-7xl mx-auto h-full grid grid-cols-4">
        {currentNavItems.map((item) => {
          // Special handling for Profile active state
          const isActive = location.pathname.startsWith(item.href) && item.href !== '/';
          const isHomeActive = location.pathname === '/';

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isNavLinkActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${
                  (item.href === '/' ? isHomeActive : isActive)
                    ? 'text-cyan-500 dark:text-cyan-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-bold tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};


// --- ICONS ---
function HomeIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function ServicesIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function LocationMarkerIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

function ProfileIcon(props: { className?: string }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}

function LoginIcon(props: { className?: string }) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    )
}

export default BottomNavBar;
