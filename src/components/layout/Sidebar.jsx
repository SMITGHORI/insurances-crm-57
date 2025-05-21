
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star, 
  FileEdit, 
  Receipt, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Settings,
  LogOut,
  Clock
} from 'lucide-react';

const Sidebar = ({ onNavItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { path: '/dashboard', icon: <Home size={20} />, name: 'Dashboard' },
    { path: '/clients', icon: <Users size={20} />, name: 'Clients' },
    { path: '/policies', icon: <FileText size={20} />, name: 'Policies' },
    { path: '/agents', icon: <Users size={20} />, name: 'Agents' },
    { path: '/claims', icon: <ShieldCheck size={20} />, name: 'Claims' },
    { path: '/leads', icon: <Star size={20} />, name: 'Leads' },
    { path: '/quotations', icon: <FileEdit size={20} />, name: 'Quotations' },
    { path: '/invoices', icon: <Receipt size={20} />, name: 'Invoices' },
    { path: '/recent-activities', icon: <Clock size={20} />, name: 'Recent Activities' },
    { path: '/settings', icon: <Settings size={20} />, name: 'Settings' },
  ];

  return (
    <aside
      className={`bg-amba-blue text-white transition-all duration-300 ease-in-out h-screen flex flex-col ${
        isCollapsed ? 'w-16 sm:w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-amba-lightblue/30">
        <div className="flex items-center justify-center flex-1 overflow-hidden">
          <img 
            src="/lovable-uploads/82237eee-d62f-4d61-b7c7-1ef7e3f95f2e.png" 
            alt="Amba Insurance" 
            className={`${isCollapsed ? 'h-8 w-auto' : 'h-10 w-auto'} transition-all duration-300`} 
          />
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-amba-lightblue/20 flex-shrink-0"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavItemClick}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md hover:bg-amba-lightblue/20 ${
                    isActive ? 'bg-amba-lightblue/30 font-medium' : ''
                  }`
                }
              >
                <span className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-amba-lightblue/30">
        <NavLink
          to="/auth"
          className="flex items-center p-2 rounded-md hover:bg-amba-lightblue/20 text-white/80 hover:text-white"
        >
          <LogOut size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
