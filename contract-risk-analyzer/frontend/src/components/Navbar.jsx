import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 text-indigo-400 font-bold text-xl tracking-tight hover:text-indigo-300 transition-colors">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <span>Contractizer</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <div className="h-4 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'G'}
                </div>
                <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/20">
              Sign In with Google
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
