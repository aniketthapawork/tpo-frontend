
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Briefcase, UserPlus, LogIn } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-slate-300 transition-colors">
          TPO Platform
        </Link>
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              <Link to="/placements" className="hover:text-slate-300 flex items-center">
                <Briefcase className="mr-2 h-5 w-5" /> Placements
              </Link>
              <span className="text-slate-300">Welcome, {user?.name} ({user?.role})</span>
              <Button onClick={handleLogout} variant="ghost" className="hover:bg-slate-700 hover:text-white">
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-slate-300 flex items-center">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Link>
              <Link to="/signup" className="hover:text-slate-300 flex items-center">
                <UserPlus className="mr-2 h-5 w-5" /> Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
