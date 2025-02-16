import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserScores } from '../types/game';
import { useNavigate } from 'react-router-dom';
import { PlayerProfile } from '../components/PlayerProfile';

export const ProfilePage: React.FC = () => {
  const [playerData, setPlayerData] = useState<UserScores | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'scores', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPlayerData({
            ...docSnap.data(),
            timestamp: docSnap.data().timestamp?.toDate() || new Date(),
          } as UserScores);
        } else {
          setPlayerData({
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            categories: {},
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <PlayerProfile playerData={playerData} onClose={() => {}} />
    </div>
  );
};