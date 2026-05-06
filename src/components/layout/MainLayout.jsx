import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Home, Search, Bell, User, LogOut, PlusSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import Avatar from '../ui/Avatar';

const MainLayout = () => {
  const { logout, user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  React.useEffect(() => {
    // Fetch unread count when user changes or on mount
    if (user?.id) {
      import('../../services/notificationService').then(({ notificationService }) => {
        notificationService.getUnreadCount()
          .then(count => setUnreadCount(count))
          .catch(err => console.error("Failed to load unread count", err));
      });
    }
  }, [user?.id, location.pathname]); // Also refresh when navigating

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: `/profile/${user?.id || 'me'}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 fixed inset-y-0 left-0 bg-white/70 backdrop-blur-xl border-r border-gray-100 hidden lg:flex flex-col z-50">
        <div className="p-8">
          <Link to="/" className="text-2xl font-black text-primary-600 tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">C</span>
            </div>
            ConnectSphere
          </Link>
        </div>

        <div className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 font-semibold'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-lg">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-6">
          <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-100">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start space-x-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 flex justify-center">
        <div className="max-w-2xl w-full min-h-screen border-x border-gray-100 bg-white shadow-sm">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 flex justify-around p-2 z-50 rounded-3xl shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`p-3 rounded-2xl transition-all duration-300 relative ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50'
                }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-white' : ''}`} />
              {item.badge > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="p-3 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </nav>
    </div>
  );
};

export default MainLayout;
