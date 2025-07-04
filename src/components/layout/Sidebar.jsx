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
  Clock,
  Gift
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useRealtimePermissions } from '@/hooks/useRealtimePermissions';

const Sidebar = ({ onNavItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { hasPermission, userRole } = usePermissions();
  
  // Initialize real-time permission updates
  useRealtimePermissions();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Define menu items with their permission requirements
  const allMenuItems = [
    { 
      path: '/dashboard', 
      icon: <Home size={20} />, 
      name: 'Dashboard',
      requiredPermission: null // Dashboard is always accessible
    },
    { 
      path: '/clients', 
      icon: <Users size={20} />, 
      name: 'Clients',
      requiredPermission: { module: 'clients', action: 'view' }
    },
    { 
      path: '/policies', 
      icon: <FileText size={20} />, 
      name: 'Policies',
      requiredPermission: { module: 'policies', action: 'view' }
    },
    { 
      path: '/claims', 
      icon: <ShieldCheck size={20} />, 
      name: 'Claims',
      requiredPermission: { module: 'claims', action: 'view' }
    },
    { 
      path: '/leads', 
      icon: <Star size={20} />, 
      name: 'Leads',
      requiredPermission: { module: 'leads', action: 'view' }
    },
    { 
      path: '/quotations', 
      icon: <FileEdit size={20} />, 
      name: 'Quotations',
      requiredPermission: { module: 'quotations', action: 'view' }
    },
    { 
      path: '/offers', 
      icon: <Gift size={20} />, 
      name: 'Offers & Broadcasts',
      requiredPermission: { module: 'offers', action: 'view' }
    },
    { 
      path: '/agents', 
      icon: <Users size={20} />, 
      name: 'Agents',
      requiredPermission: { module: 'agents', action: 'view' }
    },
    { 
      path: '/invoices', 
      icon: <Receipt size={20} />, 
      name: 'Invoices',
      requiredPermission: { module: 'invoices', action: 'view' }
    },
    { 
      path: '/recent-activities', 
      icon: <Clock size={20} />, 
      name: 'Recent Activities',
      requiredPermission: { module: 'activities', action: 'view' }
    },
    { 
      path: '/settings', 
      icon: <Settings size={20} />, 
      name: 'Settings',
      requiredPermission: null // Settings is always accessible
    },
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => {
    // Check permission if required
    if (item.requiredPermission) {
      return hasPermission(item.requiredPermission.module, item.requiredPermission.action);
    }
    
    // Show item if no permission required
    return true;
  });

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

      {/* User Role Indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-amba-lightblue/30">
          <span className="text-xs text-amba-lightblue/80 uppercase tracking-wide">
            {userRole?.replace('_', ' ') || 'User'}
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={onNavItemClick}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md hover:bg-amba-lightblue/20 transition-colors ${
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
          className="flex items-center p-2 rounded-md hover:bg-amba-lightblue/20 text-white/80 hover:text-white transition-colors"
        >
          <LogOut size={20} className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
