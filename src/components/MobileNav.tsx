import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 hover:bg-gray-800 rounded-lg transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-900 shadow-lg py-2 px-4">
          <nav className="space-y-1" aria-label="Mobile navigation">
            <Link
              to="/"
              className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}>
              Markets
            </Link>
            {user ? (<>
            <Link
              to="/dashboard"
              className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link
              to="/wallet"
              className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}>
              Wallet
            </Link>
            <Link
              to="/transactions"
              className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}>
              Transactions
            </Link>
            <Link to="/profile" className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
              Profile
            </Link>
            <Link to="/settings" className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
              Settings
            </Link>
            </>) : (<>
            <Link
              to="/login"
              className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
            <Link to="/register" className="block py-3 px-4 text-base font-medium text-white hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
              Sign Up
            </Link>
            </>)}
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNav;