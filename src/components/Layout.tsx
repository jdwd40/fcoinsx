import React from 'react';
import { Bell, Coins, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Notifications from './Notifications';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 bg-gray-900 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center flex-1">
              <Link 
                to="/" 
                className="flex items-center space-x-2"
                aria-label="FantasyCoinX Home"
              >
                <Coins className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold">FantasyCoinX</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <nav className="flex items-center space-x-6" aria-label="Main navigation">
                <Link to="/" className="text-white hover:text-indigo-400 transition-colors">
                  Markets
                </Link>
                {user && (<>
                <Link to="/dashboard" className="text-white hover:text-indigo-400 transition-colors">
                  Dashboard
                </Link>
                <Link to="/wallet" className="text-white hover:text-indigo-400 transition-colors">
                  Wallet
                </Link>
                <Link to="/transactions" className="text-white hover:text-indigo-400 transition-colors">
                  Transactions
                </Link>
                <Link to="/profile" className="text-white hover:text-indigo-400 transition-colors">
                  Profile
                </Link>
                <Link to="/settings" className="text-white hover:text-indigo-400 transition-colors">
                  Settings
                </Link>
                </>)}
              </nav>
            </div>

            <div className="flex items-center">
              <div className="flex items-center md:space-x-4">
                {user && (
                  <div className="relative hidden md:block">
                    <button 
                      onClick={handleNotificationsToggle}
                      className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                      aria-label="View notifications"
                      aria-expanded={isNotificationsOpen}
                    >
                      <Bell className="h-6 w-6" />
                    </button>
                    <Notifications isOpen={isNotificationsOpen} />
                  </div>
                )}
                
                <div className="hidden md:block">
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-300">
                        Welcome, {user.email?.split('@')[0]}
                      </span>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-4">
                      <Link
                        to="/login"
                        className="text-white hover:text-indigo-400 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleMobileMenuToggle}
                  className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                  >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div
          className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Markets
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallet"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Wallet
                </Link>
                <Link
                  to="/transactions"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <div className="px-3 py-2 space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2 text-center text-white bg-gray-800 rounded-md hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            <p className="text-xs sm:text-sm">© 2024 FantasyCoinX. All rights reserved.</p>
            <p className="mt-1 text-xs sm:text-sm">Fantasy crypto trading, real excitement.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;