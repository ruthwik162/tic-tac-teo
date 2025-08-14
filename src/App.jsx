// src/App.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRegCircle, FaRedo, FaHistory, FaTrophy, FaUser, FaGamepad, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { GiTicTacToe } from 'react-icons/gi';
import { IoClose } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
import useSound from 'use-sound';
import clickSound from './assets/sounds/click.mp3';
import winSound from './assets/sounds/win.mp3';
import drawSound from './assets/sounds/draw.mp3';
import startSound from './assets/sounds/draw.mp3';

// Helper function to calculate winner
const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: line
      };
    }
  }

  return { winner: null, winningLine: null };
};

// Load/save game history from/to localStorage
const useGameHistory = () => {
  const [games, setGames] = useState(() => {
    const saved = localStorage.getItem('tic-tac-toe-games');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('tic-tac-toe-stats');
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draws: 0 };
  });

  useEffect(() => {
    localStorage.setItem('tic-tac-toe-games', JSON.stringify(games));
    localStorage.setItem('tic-tac-toe-stats', JSON.stringify(stats));
  }, [games, stats]);

  const addGame = (game) => {
    const newGames = [...games, game];
    setGames(newGames);

    // Update stats
    const newStats = { ...stats };
    if (game.winner === 'draw') {
      newStats.draws += 1;
    } else if (game.winner) {
      newStats[game.winner] += 1;
    }
    setStats(newStats);
  };

  const clearHistory = () => {
    setGames([]);
    setStats({ X: 0, O: 0, draws: 0 });
  };

  return { games, stats, addGame, clearHistory };
};

const PlayerInputModal = ({ isOpen, onClose, onSubmit, playStartSound }) => {
  const [playerX, setPlayerX] = useState('');
  const [playerO, setPlayerO] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerX.trim() && playerO.trim()) {
      playStartSound();
      onSubmit({ playerX, playerO });
    } else {
      toast.error('Please enter names for both players', {
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
        }
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-purple-500 border-opacity-30"
            style={{
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Enter Player Names
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  Player X Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-blue-400" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={playerX}
                    onChange={(e) => setPlayerX(e.target.value)}
                    className="pl-10 w-full px-4 py-2 bg-gray-800 border border-purple-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-purple-300 transition-all duration-300"
                    placeholder="Enter X player name"
                    style={{
                      boxShadow: '0 0 10px rgba(96, 165, 250, 0.3)'
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-purple-200 mb-1">
                  Player O Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-pink-400" />
                  </div>
                  <input
                    type="text"
                    value={playerO}
                    onChange={(e) => setPlayerO(e.target.value)}
                    className="pl-10 w-full px-4 py-2 bg-gray-800 border border-pink-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white placeholder-pink-300 transition-all duration-300"
                    placeholder="Enter O player name"
                    style={{
                      boxShadow: '0 0 10px rgba(244, 114, 182, 0.3)'
                    }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Start Game</span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                    animation: 'shimmer 2s infinite'
                  }}
                ></span>
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState({ winner: null, winningLine: null });
  const [currentGame, setCurrentGame] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(true);
  const [moves, setMoves] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [gameMode, setGameMode] = useState('human'); // 'human' or 'ai'

  const [playClick] = useSound(clickSound, { volume: isMuted ? 0 : 0.5 });
  const [playWin] = useSound(winSound, { volume: isMuted ? 0 : 0.7 });
  const [playDraw] = useSound(drawSound, { volume: isMuted ? 0 : 0.7 });
  const [playStart] = useSound(startSound, { volume: isMuted ? 0 : 0.7 });

  const { games, stats, addGame, clearHistory } = useGameHistory();
  const [isAITinking, setIsAITinking] = useState(false);

  // AI move logic
  const makeAIMove = useCallback(() => {
    if (!isXNext && gameMode === 'ai' && !winnerInfo.winner && currentGame) {
      // Immediate visual feedback that AI is thinking
      setIsAITinking(true);

      // Process AI move in the next tick to avoid blocking UI
      setTimeout(() => {
        // Simple AI - first find winning move, then blocking move, then random
        let bestMove = null;

        // Check for winning move
        for (let i = 0; i < 9; i++) {
          if (!board[i]) {
            const newBoard = [...board];
            newBoard[i] = 'O';
            const { winner } = calculateWinner(newBoard);
            if (winner === 'O') {
              bestMove = i;
              break;
            }
          }
        }

        // If no winning move, check for blocking move
        if (bestMove === null) {
          for (let i = 0; i < 9; i++) {
            if (!board[i]) {
              const newBoard = [...board];
              newBoard[i] = 'X';
              const { winner } = calculateWinner(newBoard);
              if (winner === 'X') {
                bestMove = i;
                break;
              }
            }
          }
        }

        // If no winning or blocking move, choose center or random
        if (bestMove === null) {
          if (!board[4]) {
            bestMove = 4; // Prefer center
          } else {
            const availableMoves = board.map((cell, idx) => cell ? null : idx).filter(val => val !== null);
            bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          }
        }

        // Execute the move with minimal delay
        setTimeout(() => {
          setIsAITinking(false);
          if (bestMove !== null) {
            handleClick(bestMove);
          }
        }, 300); // Reduced delay for faster response
      }, 0);
    }
  }, [board, isXNext, gameMode, winnerInfo, currentGame]);

  useEffect(() => {
    makeAIMove();
  }, [board, isXNext]);

  // Calculate winner
  useEffect(() => {
    const result = calculateWinner(board);
    if (result.winner) {
      setWinnerInfo(result);
      if (result.winner !== winnerInfo.winner && currentGame) {
        const gameResult = {
          ...currentGame,
          winner: result.winner,
          endTime: new Date().toISOString(),
          moves: [...moves],
          board: [...board]
        };
        addGame(gameResult);

        // Show toast notification
        if (result.winner === 'draw') {
          playDraw();
          toast.success('Game ended in a draw!', {
            icon: '🤝',
            style: {
              background: 'rgba(30, 41, 59, 0.9)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
            }
          });
        } else {
          playWin();
          toast.success(`${currentGame[`player${result.winner}`]} wins!`, {
            icon: '🏆',
            style: {
              background: result.winner === 'X' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: result.winner === 'X' ?
                '0 0 20px rgba(59, 130, 246, 0.5)' :
                '0 0 20px rgba(239, 68, 68, 0.5)'
            }
          });
        }
      }
    } else if (!board.includes(null) && !winnerInfo.winner && currentGame) {
      setWinnerInfo({ winner: 'draw', winningLine: null });
      const gameResult = {
        ...currentGame,
        winner: 'draw',
        endTime: new Date().toISOString(),
        moves: [...moves],
        board: [...board]
      };
      addGame(gameResult);
      playDraw();
      toast.success('Game ended in a draw!', {
        icon: '🤝',
        style: {
          background: 'rgba(30, 41, 59, 0.9)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
        }
      });
    }
  }, [board]);

  const startNewGame = (players) => {
    setCurrentGame({
      playerX: players.playerX,
      playerO: gameMode === 'ai' ? 'Computer' : players.playerO,
      startTime: new Date().toISOString(),
      winner: null,
      endTime: null
    });
    setShowPlayerModal(false);
    resetGame();
    toast.success(`Game started! ${players.playerX} (X) vs ${gameMode === 'ai' ? 'Computer' : players.playerO} (O)`, {
      icon: '🎮',
      style: {
        background: 'rgba(79, 70, 229, 0.9)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)'
      }
    });
  };

  const handleClick = (index) => {
    if (board[index] || winnerInfo.winner || !currentGame) return;
    if (gameMode === 'ai' && !isXNext) return; // Prevent player from clicking during AI turn

    playClick();
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const newMove = {
      player: isXNext ? 'X' : 'O',
      position: index,
      board: [...newBoard],
      timestamp: new Date().toISOString()
    };

    setMoves([...moves, newMove]);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinnerInfo({ winner: null, winningLine: null });
    setMoves([]);
  };

  const startNewGameWithPlayers = () => {
    setShowPlayerModal(true);
    resetGame();
  };

  const renderSquare = (index) => {
    const isWinningSquare = winnerInfo.winningLine?.includes(index);
    const isActive = !board[index] && !winnerInfo.winner && currentGame;
    const isAITurn = gameMode === 'ai' && !isXNext;

    return (
      <motion.button
        whileHover={isActive && !isAITurn ? {
          scale: 1.1,
          boxShadow: isXNext ?
            '0 0 20px rgba(59, 130, 246, 0.7)' :
            '0 0 20px rgba(239, 68, 68, 0.7)'
        } : {}}
        whileTap={isActive && !isAITurn ? { scale: 0.95 } : {}}
        className={`w-20 h-20 md:w-24 md:h-24 border-2 flex items-center justify-center rounded-lg relative overflow-hidden transition-all duration-300
          ${isWinningSquare ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' : 'bg-gray-900'}
          ${isActive ? 'cursor-pointer hover:bg-gray-800' : 'cursor-default'}
          ${board[index] === 'X' ? 'border-blue-500' : board[index] === 'O' ? 'border-pink-500' : 'border-gray-700'}
        `}
        onClick={() => handleClick(index)}
        disabled={!!winnerInfo.winner || !currentGame || isAITurn}
        style={{
          boxShadow: isWinningSquare ? '0 0 25px rgba(234, 179, 8, 0.8)' : 'none'
        }}
      >
        {isWinningSquare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'radial-gradient(circle at center, rgba(234, 179, 8, 0.4) 0%, rgba(234, 179, 8, 0) 70%)',
              zIndex: 0
            }}
          />
        )}

        {isActive && !isAITurn && (
          <motion.div
            className={`absolute inset-0 opacity-0 hover:opacity-20 transition-opacity ${isXNext ? 'bg-blue-500' : 'bg-pink-500'
              }`}
          />
        )}

        <AnimatePresence>
          {board[index] && (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: board[index] === 'X' ? [0, 10, -10, 0] : 0
              }}
              transition={{
                duration: 0.3,
                rotate: { repeat: board[index] === 'X' ? 1 : 0, duration: 0.5 }
              }}
              className={`relative z-10 ${board[index] === 'X' ? 'text-blue-400' : 'text-pink-400'}`}
            >
              {board[index] === 'X' ? (
                <FaTimes className="text-4xl md:text-5xl" />
              ) : (
                <FaRegCircle className="text-3xl md:text-4xl" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .neon-text {
            text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073;
          }
          .neon-pulse {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
            50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
            100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
          }
        `}
      </style>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: 'backdrop-blur-sm'
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="absolute rounded-full bg-purple-500 opacity-10"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(40px)'
            }}
          />
        ))}
      </div>

      <PlayerInputModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        onSubmit={startNewGame}
        playStartSound={playStart}
      />

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center mb-6 md:mb-8 relative z-10"
      >
        <GiTicTacToe className="text-4xl md:text-5xl text-purple-400 mr-3" />
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          NEON TIC TAC TOE
        </h1>
      </motion.div>

      <div className="flex gap-4 mb-4 z-10">
        <button
          onClick={() => setGameMode('human')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${gameMode === 'human' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-800 text-gray-300'}`}
        >
          Player vs Player
        </button>
        <button
          onClick={() => setGameMode('ai')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${gameMode === 'ai' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30' : 'bg-gray-800 text-gray-300'}`}
        >
          Player vs AI
        </button>
      </div>

      {currentGame && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 bg-gray-800 p-4 rounded-xl shadow-lg w-full max-w-md border border-gray-700 relative z-10"
          style={{
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
          }}
        >
          <div className="flex justify-between items-center">
            <div className={`flex items-center transition-all ${isXNext && !winnerInfo.winner ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}>
              <FaUser className="mr-2" />
              <span>{currentGame.playerX}</span>
              <span className="ml-2 text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">X</span>
            </div>
            <div className="text-gray-500 mx-2">vs</div>
            <div className={`flex items-center transition-all ${!isXNext && !winnerInfo.winner ? 'text-pink-400 font-semibold' : 'text-gray-400'}`}>
              <FaUser className="mr-2" />
              <span>{currentGame.playerO}</span>
              <span className="ml-2 text-xs bg-pink-900 text-pink-300 px-2 py-1 rounded">O</span>
            </div>
          </div>
        </motion.div>
      )}

      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-4 rounded-xl shadow-lg mb-6 md:mb-8 w-full max-w-md border border-gray-700 relative z-10"
          style={{
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 flex items-center">
              <FaTrophy className="mr-2 text-yellow-400" /> Game Stats
            </h2>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-gray-900 rounded-lg border border-blue-500 border-opacity-30">
              <span className="text-blue-400 font-bold text-2xl">{stats.X}</span>
              <span className="text-sm text-gray-400">X Wins</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-900 rounded-lg border border-gray-700">
              <span className="text-gray-300 font-bold text-2xl">{stats.draws}</span>
              <span className="text-sm text-gray-400">Draws</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-900 rounded-lg border border-pink-500 border-opacity-30">
              <span className="text-pink-400 font-bold text-2xl">{stats.O}</span>
              <span className="text-sm text-gray-400">O Wins</span>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 p-4 rounded-xl shadow-lg mb-6 md:mb-8 w-full max-w-md flex justify-center border border-gray-700 relative z-10"
        style={{
          boxShadow: '0 0 15px rgba(236, 72, 153, 0.3)'
        }}
      >
        {winnerInfo.winner ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center ${winnerInfo.winner === 'draw' ? 'text-gray-300' : winnerInfo.winner === 'X' ? 'text-blue-400' : 'text-pink-400'}`}
          >
            {winnerInfo.winner === 'draw' ? (
              <>
                <span className="text-xl font-semibold">It's a draw!</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <FaTrophy className="mr-2 text-yellow-400" />
                </motion.div>
                <span className="text-xl font-semibold">
                  {currentGame[`player${winnerInfo.winner}`]} wins!
                </span>
              </>
            )}
          </motion.div>
        ) : currentGame ? (
          <motion.div
            animate={{
              x: [0, 5, -5, 0],
              textShadow: isXNext ?
                '0 0 10px rgba(59, 130, 246, 0.7)' :
                '0 0 10px rgba(236, 72, 153, 0.7)'
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`flex items-center ${isXNext ? 'text-blue-400' : 'text-pink-400'}`}
          >
            <span className="text-xl font-semibold">
              {isXNext ? currentGame.playerX : currentGame.playerO}'s turn
            </span>
            {gameMode === 'ai' && !isXNext && (
              <motion.span
                className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                animate={{ opacity: isAITinking ? [0.6, 1, 0.6] : 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isAITinking ? 'AI thinking...' : ''}
              </motion.span>
            )}
          </motion.div>
        ) : (
          <div className="text-gray-500">No active game</div>
        )}
      </motion.div>
        <h1 className='font-bold md:text-5xl text-indigo-300 mt-10 text-3xl'>Tic Tac Teo game</h1>
      <div className="grid grid-cols-3 gap-3 py-25 mb-6 md:mb-8 relative z-10">
        {Array(9).fill(null).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {renderSquare(index)}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 md:gap-4 mb-6 md:mb-8 justify-center relative z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startNewGameWithPlayers}
          className="px-4 md:px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg font-medium flex items-center relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center">
            <FaUser className="mr-2" /> New Game
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-lg font-medium flex items-center relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center">
            <FaHistory className="mr-2" /> {showHistory ? 'Hide' : 'Show'} History
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowStats(!showStats)}
          className="px-4 md:px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg shadow-lg font-medium flex items-center relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center">
            <FaTrophy className="mr-2" /> {showStats ? 'Hide' : 'Show'} Stats
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </motion.button>

        {currentGame && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="px-4 md:px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg shadow-lg font-medium flex items-center relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              <FaRedo className="mr-2" /> Reset Board
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg p-4 mb-8 overflow-hidden border border-gray-700 relative z-10"
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                <FaGamepad className="mr-2 text-purple-400" /> Game History
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => clearHistory()}
                  className="text-sm bg-red-900 hover:bg-red-800 text-red-100 px-3 py-1 rounded-lg transition-colors flex items-center"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-lg transition-colors flex items-center"
                >
                  Close
                </button>
              </div>
            </div>

            {games.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">No games recorded yet</p>
                <p className="text-sm text-gray-400">Play a game to see it here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {games.slice().reverse().map((game, index) => (
                  <motion.div
                    key={game.startTime}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${game.winner === 'X' ? 'border-blue-900 bg-blue-900 bg-opacity-20' :
                        game.winner === 'O' ? 'border-pink-900 bg-pink-900 bg-opacity-20' :
                          'border-gray-700 bg-gray-700 bg-opacity-20'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">
                          <span className={game.winner === 'X' ? 'text-blue-400' : 'text-gray-400'}>{game.playerX}</span>
                          <span className="mx-2 text-gray-500">vs</span>
                          <span className={game.winner === 'O' ? 'text-pink-400' : 'text-gray-400'}>{game.playerO}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(game.startTime).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${game.winner === 'X' ? 'bg-blue-900 text-blue-300' :
                          game.winner === 'O' ? 'bg-pink-900 text-pink-300' :
                            'bg-gray-700 text-gray-300'
                        }`}>
                        {game.winner === 'draw' ? 'Draw' : `${game.winner} won`}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {game.board.map((cell, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 flex items-center justify-center text-xs rounded ${cell === 'X' ? 'bg-blue-900 text-blue-300' :
                              cell === 'O' ? 'bg-pink-900 text-pink-300' :
                                'bg-gray-700 text-gray-500'
                            }`}
                        >
                          {cell || '-'}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {game.moves.length} moves • Duration: {game.endTime ?
                        `${Math.round((new Date(game.endTime) - new Date(game.startTime)) / 1000)}s` :
                        'N/A'}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute bottom-4 right-4 text-gray-500 text-sm z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
      >
        <a href="https://github.com/ruthwik162" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
          GitHub
        </a>
      </motion.div>
    </div>
  );
}

export default App;