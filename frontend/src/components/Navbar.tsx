import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowUpRight, Users, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ShelfLife</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  IA2 Admin
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden sm:block">Campus Library Management System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/books" className={navLinkClass}>
              <BookOpen className="w-4 h-4" />
              <span>Books</span>
            </NavLink>
            <NavLink to="/issue" className={navLinkClass}>
              <ArrowUpRight className="w-4 h-4" />
              <span>Issue Book</span>
            </NavLink>
            <NavLink to="/members" className={navLinkClass}>
              <Users className="w-4 h-4" />
              <span>Members</span>
            </NavLink>
          </nav>

          {/* Librarian Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <div className="font-semibold text-slate-800 capitalize">{user?.role || 'Librarian'}</div>
                <div className="text-slate-600 truncate max-w-[130px]">{user?.email || 'admin'}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
              title="Sign out of system"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
