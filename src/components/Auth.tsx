import React from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { LogIn, LogOut } from 'lucide-react';

export const Auth: React.FC = () => {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    return auth.onAuthStateChanged(user => setUser(user));
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
        <img
          src={user.photoURL || ''}
          alt={user.displayName || 'User'}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-semibold">{user.displayName}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md 
            hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg 
        hover:bg-blue-700 transition-colors font-medium"
    >
      <LogIn className="w-5 h-5" />
      Sign in with Google to Play
    </button>
  );
};