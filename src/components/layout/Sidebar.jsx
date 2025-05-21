
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart2,
  Users,
  FileText,
  User,
  LogOut,
  AlertCircle,
  Settings
} from "lucide-react";
import logo from "../../assets/logo.svg";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  // Define navigation items with their paths and icons
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <BarChart2 size={20} /> },
    { name: "Clients", path: "/clients", icon: <Users size={20} /> },
    { name: "Policies", path: "/policies", icon: <FileText size={20} /> },
    { name: "Claims", path: "/claims", icon: <AlertCircle size={20} /> },
    { name: "Agents", path: "/agents", icon: <User size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> }
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <img src={logo} alt="AMBA Logo" className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl text-gray-800">AMBA</span>
          </div>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={toggleSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-2">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-amba-blue text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
