
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const MainLayout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar-container');
      if (isMobile && showMobileSidebar && sidebar && !sidebar.contains(event.target)) {
        const isMenuButton = event.target.closest('[data-menu-button]');
        if (!isMenuButton) {
          setShowMobileSidebar(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, showMobileSidebar]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar-container"
        className={`fixed lg:relative lg:block z-20 h-full transition-transform duration-300 ease-in-out ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar onNavItemClick={closeSidebar} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto p-2 md:p-4 max-w-full">
          <div className="max-w-full overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
