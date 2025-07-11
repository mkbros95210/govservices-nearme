import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-8 mt-12 border-t border-slate-200 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} NearMe. All rights reserved
      </p>
    </footer>
  );
};

export default Footer;