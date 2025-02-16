import React from 'react';
import { Trophy, Settings, User, GamepadIcon, LogOut, ChevronDown } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { Auth } from './Auth';
import { signOut } from 'firebase/auth';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const user = auth.currentUser;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMenu = () => setIsProfileMenuOpen(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <GamepadIcon className="w-6 h-6 text-blue-600" />
            Tic Tac Toe
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isActive('/') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <GamepadIcon className="w-5 h-5" />
                Game
              </Link>

              <Link
                to="/leaderboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isActive('/leaderboard') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Trophy className="w-5 h-5" />
                Leaderboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 
                    transition-colors"
                >
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{user.displayName}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={closeMenu}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20
                      py-1 border border-gray-200">
                      <Link
                        to="/profile"
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50
                          transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={closeMenu}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50
                          transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Game Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50
                          transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Auth />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};