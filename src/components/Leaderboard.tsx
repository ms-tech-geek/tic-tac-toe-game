import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GameScore } from '../types/game';
import { Trophy, Medal, Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<GameScore[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      orderBy('wins', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const newScores = snapshot.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as GameScore[];
      setScores(newScores);
    });
  }, []);

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>
      
      <div className="space-y-4">
        {scores.map((score, index) => (
          <div
            key={score.userId}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
            {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
            {index === 2 && <Award className="w-5 h-5 text-amber-600" />}
            {index > 2 && <span className="w-5 text-center">{index + 1}</span>}
            }
            
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