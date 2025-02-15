import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GameScore } from '../types/game';
import { Trophy, Medal, Award } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

export const Leaderboard: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  const getRankIndicator = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 text-center">{index + 1}</span>;
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      orderBy('wins', 'desc'),
      limit(10)
    );

    try {
      setLoading(true);
      return onSnapshot(q, 
        (snapshot) => {
          const newScores = snapshot.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as GameScore[];
          setScores(newScores);
          setError(null);
          setLoading(false);
        },
        (error: FirebaseError) => {
          console.error('Firestore error:', error);
          let errorMessage = 'Unable to load leaderboard. ';
          
          switch (error.code) {
            case 'permission-denied':
              errorMessage += 'Permission denied. Please check Firestore rules.';
              break;
            case 'unavailable':
              errorMessage += 'Service is temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage += 'Please try again later.';
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Firestore setup error:', error);
      setError('Unable to connect to leaderboard.');
      setLoading(false);
      return () => {};
    }
  }, []);

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-4 text-gray-500">
            <p>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-600">
            <p>{error}</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            <p>No scores yet. Be the first to play!</p>
          </div>
        ) : scores.map((score, index) => (
          <div
            key={score.userId}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            {getRankIndicator(index)}
            
            
            <div className="flex-1">
              <p className="font-semibold">{score.userName}</p>
              <p className="text-sm text-gray-600">
                {score.wins} wins · {score.losses} losses · {score.draws} draws
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>{score.difficulty}</p>
              <p>{score.boardSize}x{score.boardSize}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};