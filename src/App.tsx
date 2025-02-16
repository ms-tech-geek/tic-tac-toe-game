import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { GamePage } from './pages/GamePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { Auth } from './components/Auth';
import { auth } from './lib/firebase';
import { User } from 'firebase/auth';

function App() {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      console.log('Auth state updated in App:', user?.email);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-end">
              <Auth />
            </div>

            {user ? (
              <Routes>
                <Route path="/" element={<GamePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  Welcome to Tic Tac Toe!
                </h1>
                <p className="text-gray-600">
                  Sign in to start playing against the computer and track your scores.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
