import React from 'react';
import { Auth } from './components/Auth';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { GameStatus } from './components/GameStatus';
import { Leaderboard } from './components/Leaderboard';
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-end">
          <Auth />
        </div>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <GameStatus />
              <div className="flex items-center justify-center">
                <GameBoard />
              </div>
              <GameControls />
            </div>
            <Leaderboard />
          </div>
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
  );
}

export default App;
