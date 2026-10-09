import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  X,
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  PlusCircle,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-4 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search free courses, topics, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/courses"
              className={`text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/courses') && !location.pathname.includes('/teacher')
                  ? 'text-brand-600'
                  : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Explore Courses
            </Link>

            <Link
              to="/verify"
              className={`text-sm font-semibold transition-colors ${
                location.pathname === '/verify'
                  ? 'text-brand-600'
                  : 'text-slate-600 hover:text-brand-600'
              }`}
            >
              Verify Certificate
            </Link>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* In-app Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors relative"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-[11px] font-semibold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                if (!n.isRead) markAsRead(n._id);
                                if (n.link) navigate(n.link);
                              }}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                  {n.title}
                                </h5>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          View all notifications &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-slate-700 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
                      <div className="px-4 py-3 bg-slate-50">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <Badge variant="role">{user.role}</Badge>
                        </div>
                      </div>

                      <div className="py-1">
                        {user.role === 'teacher' ? (
                          <>
                            <Link
                              to="/teacher/dashboard"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" />
                              Teacher Dashboard
                            </Link>
                            <Link
                              to="/teacher/courses"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <BookOpen className="w-4 h-4 text-slate-400" />
                              My Courses
                            </Link>
                            <Link
                              to="/teacher/courses/new"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <PlusCircle className="w-4 h-4 text-slate-400" />
                              Create Course
                            </Link>
                            <Link
                              to="/teacher/profile"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              Teacher Profile
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" />
                              Student Dashboard
                            </Link>
                            <Link
                              to="/my-learning"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <CheckCircle className="w-4 h-4 text-slate-400" />
                              My Learning
                            </Link>
                            <Link
                              to="/certificates"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <Award className="w-4 h-4 text-slate-400" />
                              My Certificates
                            </Link>
                            <Link
                              to="/history"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <Clock className="w-4 h-4 text-slate-400" />
                              Learning History
                            </Link>
                            <Link
                              to="/profile"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <UserIcon className="w-4 h-4 text-slate-400" />
                              Student Profile
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:shadow-lg"
                >
                  Join for Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </form>

          <div className="flex flex-col space-y-2 pt-2">
            <Link
              to="/courses"
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Explore Courses
            </Link>
            <Link
              to="/verify"
              className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Verify Certificate
            </Link>

            {user ? (
              <>
                <div className="pt-2 border-t border-slate-100">
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {user.role} Space
                  </p>
                  {user.role === 'teacher' ? (
                    <>
                      <Link
                        to="/teacher/dashboard"
                        className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        Teacher Dashboard
                      </Link>
                      <Link
                        to="/teacher/courses"
                        className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        My Courses
                      </Link>
                      <Link
                        to="/teacher/courses/new"
                        className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        Create Course
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        Student Dashboard
                      </Link>
                      <Link
                        to="/my-learning"
                        className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        My Learning
                      </Link>
                      <Link
                        to="/certificates"
                        className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        My Certificates
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl mt-2"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-600 rounded-xl shadow-md"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
