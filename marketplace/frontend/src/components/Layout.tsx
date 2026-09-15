import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/client';
import { Bell } from 'lucide-react';

const Layout: React.FC = () => {
  const { data: unreadCount = 0, isPending } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center space-x-3 font-semibold text-xl text-gray-800">
                Marketplace
              </NavLink>
            </div>
            <div className="flex items-center space-x-4">
              <NavLink to="/profile" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Profile
              </NavLink>
              <NavLink to="/notifications" className="relative">
                <button className="relative flex items-center p-2 rounded-md hover:bg-gray-200">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {!isPending && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-red-500 text-xs text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {isPending && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4"></span>
                  )}
                </button>
              </NavLink>
            </div>
          </div>
        </nav>
      </header>

      <main className="py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
