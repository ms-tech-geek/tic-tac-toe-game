import { GameBoard, Player, GameDifficulty } from '../types/game';

export const calculateWinner = (board: GameBoard): Player | 'draw' | null => {
  const size = board.length;
  
  // Check rows
  for (let row = 0; row < size; row++) {
    if (board[row][0] && board[row].every(cell => cell === board[row][0])) {
      return board[row][0];
    }
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    if (board[0][col] && board.every(row => row[col] === board[0][col])) {
      return board[0][col];
    }
  }

  // Check diagonals
  if (board[0][0] && board.every((row, i) => row[i] === board[0][0])) {
    return board[0][0];
  }
  
  if (board[0][size-1] && board.every((row, i) => row[size-1-i] === board[0][size-1])) {
    return board[0][size-1];
  }

  // Check for draw
  if (board.flat().every(cell => cell !== null)) {
    return 'draw';
  }

  return null;
};

interface Move {
  row: number;
  col: number;
  score: number;
}

export const minimax = (board: GameBoard, difficulty: GameDifficulty): { row: number; col: number } | null => {
  const availableMoves = [];
  
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (!board[i][j]) {
        availableMoves.push({ row: i, col: j });
      }
    }
  }

  if (availableMoves.length === 0) return null;

  // For easy difficulty, make random moves
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // For medium difficulty, make smart moves 50% of the time
  if (difficulty === 'medium' && Math.random() < 0.5) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // For hard difficulty or medium (other 50%), use minimax algorithm
  let bestMove: Move = { row: -1, col: -1, score: -Infinity };

  for (const move of availableMoves) {
    board[move.row][move.col] = 'O';
    const score = minimaxScore(board, 0, false);
    board[move.row][move.col] = null;

    if (score > bestMove.score) {
      bestMove = { ...move, score };
    }
  }

  return { row: bestMove.row, col: bestMove.col };
};

const minimaxScore = (board: GameBoard, depth: number, isMaximizing: boolean): number => {
  const winner = calculateWinner(board);
  
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (!board[i][j]) {
          board[i][j] = 'O';
          bestScore = Math.max(bestScore, minimaxScore(board, depth + 1, false));
          board[i][j] = null;
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board.length; j++) {
        if (!board[i][j]) {
          board[i][j] = 'X';
          bestScore = Math.min(bestScore, minimaxScore(board, depth + 1, true));
          board[i][j] = null;
        }
      }
    }
    return bestScore;
  }
};