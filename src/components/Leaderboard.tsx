import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserScores, GameDifficulty, BoardSize, CategoryScore } from '../types/game';
import { Trophy, Medal, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { FirebaseError } from 'firebase/app';

type LeaderboardCategory = {
  difficulty: GameDifficulty;
  boardSize: BoardSize;
};

export const Leaderboard: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<UserScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>({
    difficulty: 'hard',
    boardSize: 3
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const getRankIndicator = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 text-center">{index + 1}</span>;
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    scores.forEach(score => {
      if (score.categories) {
        Object.keys(score.categories).forEach(key => {
        uniqueCategories.add(key);
        });
      }
    });
    return Array.from(uniqueCategories).map(cat => {
      const [difficulty, boardSize] = cat.split('-');
      return {
        difficulty: difficulty as GameDifficulty,
        boardSize: parseInt(boardSize) as BoardSize
      };
    });
  }, [scores]);

  const filteredScores = useMemo(() => {
    const categoryKey = `${selectedCategory.difficulty}-${selectedCategory.boardSize}`;
    return scores
      .filter(score => score.categories && score.categories[categoryKey])
      .map(score => ({
        userId: score.userId,
        userName: score.userName,
        stats: score.categories[categoryKey]
      }))
      .sort((a, b) => {
        const aStats = a.stats;
        const bStats = b.stats;
        const aTotal = aStats.wins + aStats.losses + aStats.draws;
        const bTotal = bStats.wins + bStats.losses + bStats.draws;
        const aWinRate = aTotal > 0 ? (aStats.wins / aTotal) * 100 : 0;
        const bWinRate = bTotal > 0 ? (bStats.wins / bTotal) * 100 : 0;
        return bWinRate - aWinRate;
      })
      .slice(0, 5);
  }, [scores, selectedCategory]);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      limit(100)
    );

    try {
      setLoading(true);
      return onSnapshot(q, 
        (snapshot) => {
          const newScores = snapshot.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          })) as UserScores[];
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

  const formatWinRate = (stats: CategoryScore) => {
    const total = stats.wins + stats.losses + stats.draws;
    if (total === 0) return '0%';
    return `${((stats.wins / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {categories.map(category => (
            <button
              key={`${category.difficulty}-${category.boardSize}`}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  selectedCategory.difficulty === category.difficulty &&
                  selectedCategory.boardSize === category.boardSize
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.difficulty} {category.boardSize}x{category.boardSize}
            </button>
          ))}
        </div>
      )}
      
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
        ) : filteredScores.map((score, index) => (
          <div
            key={score.userId}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            {getRankIndicator(index)}
            
            
            <div className="flex-1">
              <p className="font-semibold">{score.userName}</p>
              <p className="text-sm text-gray-600">
                Win rate: {formatWinRate(score.stats)}
              </p>
              <p className="text-xs text-gray-500">
                {score.stats.wins}W · {score.stats.losses}L · {score.stats.draws}D
              </p>
            </div>
          </div>
        ))}
        
        <div className="text-center text-sm text-gray-500 mt-2">
          Showing top 5 players for {selectedCategory.difficulty} mode
          {' '}{selectedCategory.boardSize}x{selectedCategory.boardSize}
        </div>
      </div>
    </div>
  );
};