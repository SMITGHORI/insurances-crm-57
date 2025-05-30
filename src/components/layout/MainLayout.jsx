
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const MainLayout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousComponent, setPreviousComponent] = useState(null);
  const isMobile = useIsMobile();
  const location = useLocation();

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(false);
    }
  };

  // Handle smooth transitions between routes
  useEffect(() => {
    setIsTransitioning(true);
    
    // Very quick transition to prevent any flash
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setPreviousComponent(null);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

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

  // Close sidebar when route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden animate-fade-in"
          onClick={toggleMobileSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar-container"
        className={`fixed lg:relative lg:block z-30 h-full transition-transform duration-300 ease-in-out ${
          showMobileSidebar ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        }`}
      >
        <Sidebar onNavItemClick={closeSidebar} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header onMenuClick={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto p-1 md:p-4 max-w-full relative bg-gray-50">
          <div className="container mx-auto max-w-full overflow-x-hidden px-0">
            {/* Smooth transition container - no opacity change to prevent white flash */}
            <div className="min-h-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      
      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
