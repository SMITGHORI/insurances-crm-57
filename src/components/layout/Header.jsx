
import React, { useState } from 'react';
import { Bell, Mail, Search, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    if (isMobile) {
      setShowMobileSearch(false);
    }
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-2 sm:px-4">
      {isMobile && showMobileSearch ? (
        <div className="w-full py-1 animate-fade-in">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              className="flex-1 pl-3 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amba-blue focus:border-amba-blue text-sm"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button 
              type="submit" 
              className="rounded-l-none"
            >
              Search
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileSearch}
              className="ml-1"
            >
              Cancel
            </Button>
          </form>
        </div>
      ) : (
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

          {/* Search - Desktop */}
          {!isMobile && (
            <div className="flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amba-blue focus:border-amba-blue text-sm"
                  placeholder="Search clients, policies, claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          )}

          {/* Right side icons */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 ml-auto">
            {isMobile && (
              <button
                onClick={toggleMobileSearch}
                className="p-2 rounded-md text-gray-600 hover:text-amba-blue hover:bg-gray-100"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            
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
      )}
    </header>
  );
};

export default Header;
