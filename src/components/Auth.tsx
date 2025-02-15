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
      console.log('Attempting Google sign-in...');
      // Verify provider configuration
      if (!googleProvider) {
        throw new Error('Google provider not configured');
      }
      
      // Log auth instance state
      console.log('Auth state before sign-in:', {
        currentUser: auth.currentUser,
        isSignInWithPopupSupported: typeof signInWithPopup === 'function'
      });

      await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful');
    } catch (error: any) {
      console.error('Authentication error:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        credential: error.credential,
        email: error.email,
        phoneNumber: error.phoneNumber
      });

      // Show user-friendly error message
      switch (error.code) {
        case 'auth/operation-not-allowed':
          alert(
            'Google sign-in is not enabled. Please follow these steps:\n\n' +
            '1. Go to Firebase Console\n' +
            '2. Select project "tic-tac-toe-game-4ecfa"\n' +
            '3. Click Authentication in sidebar\n' +
            '4. Go to Sign-in method tab\n' +
            '5. Enable Google provider\n' +
            '6. Save changes'
          );
          break;
        case 'auth/popup-blocked':
          alert('Sign-in popup was blocked. Please allow popups for this site.');
          break;
        case 'auth/popup-closed-by-user':
          console.log('Sign-in popup was closed by the user');
          break;
        case 'auth/cancelled-popup-request':
          console.log('Sign-in popup request was cancelled');
          break;
        case 'auth/invalid-api-key':
          alert('Invalid Firebase configuration. Please check your environment variables.');
          break;
        case 'auth/network-request-failed':
          alert('Network error. Please check your internet connection.');
          break;
        default:
          alert(`Sign-in failed (${error.code}): ${error.message}\n\nPlease try again or contact support if the issue persists.`);
      }
      
      // Log detailed error information for debugging
      console.error('Detailed auth error:', {
        errorCode: error.code,
        errorMessage: error.message,
        authConfig: {
          apiKey: '***' + import.meta.env.VITE_FIREBASE_API_KEY.slice(-6),
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
        }
      });
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