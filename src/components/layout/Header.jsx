
import React from 'react';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MessagesDropdown from '../header/MessagesDropdown';
import NotificationsDropdown from '../header/NotificationsDropdown';
import ProfileDropdown from '../header/ProfileDropdown';

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
              <MessagesDropdown />
              <NotificationsDropdown />
              <div className="border-l border-gray-300 h-6 mx-1 hidden md:block"></div>
            </>
          )}
          
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
