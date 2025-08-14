// src/App.js
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRegCircle, FaRedo, FaHistory, FaTrophy, FaUser, FaGamepad } from 'react-icons/fa';
import { GiTicTacToe } from 'react-icons/gi';
import { IoClose } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';

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

const PlayerInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [playerX, setPlayerX] = useState('');
  const [playerO, setPlayerO] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerX.trim() && playerO.trim()) {
      onSubmit({ playerX, playerO });
    } else {
      toast.error('Please enter names for both players');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Enter Player Names
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player X Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-blue-500" />
                  </div>
                  <input
                    type="text"
                    value={playerX}
                    onChange={(e) => setPlayerX(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter X player name"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player O Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-red-500" />
                  </div>
                  <input
                    type="text"
                    value={playerO}
                    onChange={(e) => setPlayerO(e.target.value)}
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter O player name"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium shadow-md"
              >
                Start Game
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

  const { games, stats, addGame, clearHistory } = useGameHistory();

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
          toast.success('Game ended in a draw!', {
            icon: '🤝',
            style: {
              background: '#f0f0f0',
              color: '#333',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }
          });
        } else {
          toast.success(`${currentGame[`player${result.winner}`]} wins!`, {
            icon: '🏆',
            style: {
              background: result.winner === 'X' ? '#3b82f6' : '#ef4444',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
      toast.success('Game ended in a draw!', {
        icon: '🤝',
        style: {
          background: '#f0f0f0',
          color: '#333',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      });
    }
  }, [board]);

  const startNewGame = (players) => {
    setCurrentGame({
      playerX: players.playerX,
      playerO: players.playerO,
      startTime: new Date().toISOString(),
      winner: null,
      endTime: null
    });
    setShowPlayerModal(false);
    resetGame();
    toast.success(`Game started! ${players.playerX} (X) vs ${players.playerO} (O)`, {
      icon: '🎮',
      style: {
        background: '#4f46e5',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    });
  };

  const handleClick = (index) => {
    if (board[index] || winnerInfo.winner || !currentGame) return;

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
    
    return (
      <motion.button
        whileHover={{ scale: winnerInfo.winner ? 1 : 1.05 }}
        whileTap={{ scale: winnerInfo.winner ? 1 : 0.95 }}
        className={`w-20 h-20 md:w-24 md:h-24 border-2 border-gray-300 text-4xl font-bold flex items-center justify-center rounded-lg shadow-md relative overflow-hidden
          ${isWinningSquare ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' : 'bg-white'}
          ${!board[index] && !winnerInfo.winner ? 'hover:bg-gray-50' : ''}
        `}
        onClick={() => handleClick(index)}
        disabled={!!winnerInfo.winner || !currentGame}
      >
        {isWinningSquare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0) 70%)',
              zIndex: 0
            }}
          />
        )}
        
        <AnimatePresence>
          {board[index] && (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                rotate: board[index] === 'X' ? [0, 10, -10, 0] : 0
              }}
              transition={{ 
                duration: 0.3,
                rotate: { repeat: board[index] === 'X' ? 1 : 0, duration: 0.5 }
              }}
              className={`relative z-10 ${board[index] === 'X' ? 'text-blue-600' : 'text-red-600'}`}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 relative">
      <Toaster position="top-center" reverseOrder={false} />
      
      <PlayerInputModal 
        isOpen={showPlayerModal} 
        onClose={() => setShowPlayerModal(false)} 
        onSubmit={startNewGame}
      />

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center mb-6 md:mb-8"
      >
        <GiTicTacToe className="text-4xl md:text-5xl text-purple-600 mr-3" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Tic Tac Toe</h1>
      </motion.div>

      {currentGame && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 bg-white p-3 rounded-lg shadow-md w-full max-w-md"
        >
          <div className="flex justify-between items-center">
            <div className={`flex items-center ${isXNext && !winnerInfo.winner ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
              <FaUser className="mr-2" />
              <span>{currentGame.playerX}</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">X</span>
            </div>
            <div className="text-gray-400 mx-2">vs</div>
            <div className={`flex items-center ${!isXNext && !winnerInfo.winner ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              <FaUser className="mr-2" />
              <span>{currentGame.playerO}</span>
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">O</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-6 md:mb-8 w-full max-w-4xl">
        <div className="bg-white p-4 rounded-xl shadow-lg flex-1">
          <h2 className="text-xl font-semibold mb-3 text-center flex items-center justify-center">
            <FaTrophy className="mr-2 text-yellow-500" /> Stats
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-blue-600 font-bold text-2xl">{stats.X}</span>
              <span className="text-sm text-gray-600">X Wins</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600 font-bold text-2xl">{stats.draws}</span>
              <span className="text-sm text-gray-600">Draws</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-red-600 font-bold text-2xl">{stats.O}</span>
              <span className="text-sm text-gray-600">O Wins</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg flex-1 flex flex-col items-center justify-center">
          {winnerInfo.winner ? (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center ${winnerInfo.winner === 'draw' ? 'text-gray-700' : winnerInfo.winner === 'X' ? 'text-blue-600' : 'text-red-600'}`}
            >
              {winnerInfo.winner === 'draw' ? (
                <>
                  <span className="text-xl font-semibold">It's a draw!</span>
                </>
              ) : (
                <>
                  <FaTrophy className="mr-2 text-yellow-500" />
                  <span className="text-xl font-semibold">
                    {currentGame[`player${winnerInfo.winner}`]} wins!
                  </span>
                </>
              )}
            </motion.div>
          ) : currentGame ? (
            <motion.div 
              animate={{ x: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`flex items-center ${isXNext ? 'text-blue-600' : 'text-red-600'}`}
            >
              <span className="text-xl font-semibold">
                {isXNext ? currentGame.playerX : currentGame.playerO}'s turn
              </span>
            </motion.div>
          ) : (
            <div className="text-gray-500">No active game</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
        {Array(9).fill(null).map((_, index) => (
          <div key={index}>
            {renderSquare(index)}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 md:gap-4 mb-6 md:mb-8 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startNewGameWithPlayers}
          className="px-4 md:px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md font-medium flex items-center"
        >
          <FaUser className="mr-2" /> New Game
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-md font-medium flex items-center"
        >
          <FaHistory className="mr-2" /> {showHistory ? 'Hide' : 'Show'} History
        </motion.button>
        
        {currentGame && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="px-4 md:px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg shadow-md font-medium flex items-center"
          >
            <FaRedo className="mr-2" /> Reset Board
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 mb-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FaGamepad className="mr-2 text-purple-600" /> Game History
              </h3>
              <button 
                onClick={() => clearHistory()}
                className="text-sm text-red-500 hover:text-red-700 flex items-center"
              >
                Clear All
              </button>
            </div>
            
            {games.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-2">No games recorded yet</p>
                <p className="text-sm text-gray-400">Play a game to see it here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {games.slice().reverse().map((game, index) => (
                  <motion.div
                    key={game.startTime}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border ${game.winner === 'X' ? 'border-blue-100 bg-blue-50' : game.winner === 'O' ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">
                          <span className={game.winner === 'X' ? 'text-blue-600' : 'text-gray-600'}>{game.playerX}</span>
                          <span className="mx-2 text-gray-400">vs</span>
                          <span className={game.winner === 'O' ? 'text-red-600' : 'text-gray-600'}>{game.playerO}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(game.startTime).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        game.winner === 'X' ? 'bg-blue-100 text-blue-800' : 
                        game.winner === 'O' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {game.winner === 'draw' ? 'Draw' : `${game.winner} won`}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {game.board.map((cell, i) => (
                        <div 
                          key={i} 
                          className={`w-6 h-6 flex items-center justify-center text-xs rounded ${
                            cell === 'X' ? 'bg-blue-100 text-blue-600' : 
                            cell === 'O' ? 'bg-red-100 text-red-600' : 
                            'bg-gray-100'
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
    </div>
  );
}

export default App;