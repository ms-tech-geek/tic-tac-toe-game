import React from 'react';
import { Trophy, Settings, User, GamepadIcon } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const user = auth.currentUser;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <GamepadIcon className="w-6 h-6 text-blue-600" />
            Tic Tac Toe
          </Link>

          {user && (
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

              <Link
                to="/settings"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isActive('/settings') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isActive('/profile') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};