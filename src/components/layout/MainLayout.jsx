import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Home, Search, Bell, User, LogOut, PlusSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import Avatar from '../ui/Avatar';
import RightSidebar from './RightSidebar';

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
    <div className="h-screen w-screen bg-[#050505] flex justify-center selection:bg-primary-500/30 selection:text-white grain overflow-hidden">
      {/* Background Aurora Blobs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full animate-aurora [animation-delay:-5s]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-teal-500/5 blur-[80px] rounded-full animate-aurora [animation-delay:-10s]" />
      </div>

      <div className="max-w-[90rem] w-full flex justify-center gap-12 px-8 h-full relative">
        {/* Desktop Sidebar Navigation (Locked) */}
        <aside className="w-64 py-8 flex flex-col h-full hidden lg:flex">
          <nav className="flex-1 premium-glass flex flex-col rounded-[2.5rem] border-white/5 transition-all duration-500 hover:border-white/10 group/nav overflow-hidden">
            <div className="p-8">
              <Link to="/" className="group flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <span className="text-white text-2xl font-black">C</span>
                </div>
                <span className="text-2xl font-black text-gray-100 tracking-tighter transition-all duration-300 group-hover:tracking-normal group-hover:text-primary-400">ConnectSphere</span>
              </Link>
            </div>

            <div className="flex-1 px-5 space-y-2 mt-4 overflow-y-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
                      ? 'text-white font-bold'
                      : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-100 hover:translate-x-1'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-emerald-500 opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                    )}
                    
                    <div className="relative z-10">
                      <Icon className={`h-6 w-6 transition-all duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-400'}`} />
                      {item.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-dark-950">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[17px] tracking-wide relative z-10">{item.label}</span>
                    {isActive && <div className="absolute inset-0 bg-white/10 blur-xl scale-150 animate-pulse" />}
                  </Link>
                );
              })}
            </div>

            <div className="p-6 mt-auto">
              <div className="bg-dark-900/40 rounded-[2rem] p-1.5 border border-white/5 backdrop-blur-sm group-hover/nav:border-white/10 transition-colors">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start space-x-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-[1.5rem] transition-all h-12 px-5"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-bold text-[15px]">Logout</span>
                </Button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content Area (Independent Scroll) */}
        <main className="flex-1 max-w-2xl w-full h-full overflow-y-auto no-scrollbar border-x border-white/5 bg-dark-950/20 backdrop-blur-[2px] shadow-[0_0_100px_rgba(0,0,0,0.3)] relative z-0">
          <div className="min-h-full py-8">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar (Locked) */}
        <aside className="hidden xl:flex flex-col h-full py-8">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile Bottom Navigation (Floating Pill) */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 glass-dark rounded-[2.5rem] flex justify-around items-center p-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-white/10 overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`p-4 rounded-full transition-all duration-500 relative ${isActive ? 'bg-primary-500 text-white shadow-glow scale-110' : 'text-gray-500 hover:text-gray-200'
                }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-white' : ''}`} />
              {item.badge > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-dark-950 shadow-lg">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="p-4 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-500"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </nav>
    </div>
  );
};

export default MainLayout;
