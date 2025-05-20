
import React, { useState } from 'react';
import { Bell, Mail, Search, User, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-amba-blue hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amba-blue focus:border-amba-blue sm:text-sm"
              placeholder="Search clients, policies, claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative">
            <Mail className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <button className="p-1 rounded-full text-gray-600 hover:text-amba-blue hover:bg-gray-100 relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="border-l border-gray-300 h-6 mx-2"></div>
          
          <div className="flex items-center">
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-amba-blue">
              <img
                className="h-8 w-8 rounded-full mr-2"
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="User"
              />
              <span className="hidden md:block">Rahul Sharma</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
