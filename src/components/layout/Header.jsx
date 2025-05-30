
import React from 'react';
import { Bell, Mail, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = ({ onMenuClick }) => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-2 sm:px-4">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center">
          <button
            data-menu-button="true"
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-amba-blue hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 ml-auto">
          {!isMobile && (
            <>
              <button className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative" aria-label="Messages">
                <Mail className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <button className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <div className="border-l border-gray-300 h-6 mx-1 hidden md:block"></div>
            </>
          )}
          
          <div className="flex items-center">
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-amba-blue" aria-label="User profile">
              <img
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="User"
              />
              <span className="hidden md:block ml-2 max-w-[120px] truncate">Rahul Sharma</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
