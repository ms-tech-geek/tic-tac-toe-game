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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

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
            {user ? (
              <Routes>
                <Route path="/" element={<GamePage />} />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={
                    <div className="text-center space-y-4">
                      <h1 className="text-3xl font-bold text-gray-800">
                        Welcome to Tic Tac Toe!
                      </h1>
                      <p className="text-gray-600">
                        Sign in to start playing against the computer and track your scores.
                      </p>
                    </div>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
