import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameSession {
  id: string;
  game: string;
  platform: string;
  status: 'online' | 'offline' | 'away';
  currentActivity: string;
  playtime: string;
  achievement?: string;
}

const gamingSessions: GameSession[] = [
  {
    id: 'strategy_ops',
    game: 'Civilization VI',
    platform: 'Steam',
    status: 'offline',
    currentActivity: 'Last session: World domination as Rome',
    playtime: '247h',
    achievement: 'Tech victory achieved'
  },
  {
    id: 'tactical_shooter',
    game: 'Counter-Strike 2',
    platform: 'Steam',
    status: 'away',
    currentActivity: 'Practicing aim on Aim Botz',
    playtime: '892h',
    achievement: 'Eagle rank maintained'
  },
  {
    id: 'space_exploration',
    game: 'Kerbal Space Program',
    platform: 'Steam',
    status: 'offline',
    currentActivity: 'Successfully landed on Duna',
    playtime: '156h',
    achievement: 'Rocket scientist'
  },
  {
    id: 'automation',
    game: 'Factorio',
    platform: 'Steam',
    status: 'online',
    currentActivity: 'Optimizing assembly line throughput',
    playtime: '423h',
    achievement: 'The factory must grow'
  },
  {
    id: 'city_building',
    game: 'Cities: Skylines',
    platform: 'Steam',
    status: 'offline',
    currentActivity: 'Designing traffic flow optimization',
    playtime: '189h',
    achievement: 'Urban planner'
  }
];

interface MiniGameProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

function SnakeGame({ onComplete, onClose }: MiniGameProps) {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 15, y: 15 });

  useEffect(() => {
    if (!gameActive) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': setDirection({ x: 1, y: 0 }); break;
        case 'Escape': onClose(); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive, onClose]);

  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = setInterval(() => {
      setPosition(prev => {
        const newPos = {
          x: prev.x + direction.x,
          y: prev.y + direction.y
        };

        // Check boundaries
        if (newPos.x < 0 || newPos.x >= 25 || newPos.y < 0 || newPos.y >= 25) {
          setGameActive(false);
          onComplete(score);
          return prev;
        }

        // Check food collision
        if (newPos.x === food.x && newPos.y === food.y) {
          setScore(prev => prev + 10);
          setFood({
            x: Math.floor(Math.random() * 25),
            y: Math.floor(Math.random() * 25)
          });
        }

        return newPos;
      });
    }, 200);

    return () => clearInterval(gameLoop);
  }, [direction, food, score, gameActive, onComplete]);

  return (
    <div className="terminal-window max-w-lg">
      <div className="terminal-header">
        <div className="flex justify-between items-center">
          <div className="holo-text font-mono">SNAKE.EXE</div>
          <div className="text-green-500 font-mono text-sm">SCORE: {score}</div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="grid grid-cols-25 gap-0 w-full aspect-square bg-gray-900 border border-green-500/30">
          {Array.from({ length: 625 }).map((_, i) => {
            const x = i % 25;
            const y = Math.floor(i / 25);
            const isSnake = x === position.x && y === position.y;
            const isFood = x === food.x && y === food.y;
            
            return (
              <div
                key={i}
                className={`w-2 h-2 ${
                  isSnake ? 'bg-green-500' : 
                  isFood ? 'bg-red-500' : 
                  'bg-transparent'
                }`}
              />
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400 font-mono">
            Use arrow keys to move • ESC to quit
          </div>
          {!gameActive && (
            <div className="mt-2">
              <div className="text-green-500 font-mono">GAME OVER</div>
              <button 
                onClick={() => onComplete(score)}
                className="tactical-button mt-2 text-xs"
              >
                SAVE HIGH SCORE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GamingTerminal() {
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [highScore, setHighScore] = useState(localStorage.getItem('snake-high-score') || '0');

  const getStatusColor = (status: GameSession['status']) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'offline': return 'text-gray-500';
    }
  };

  const handleMiniGameComplete = (score: number) => {
    if (score > parseInt(highScore)) {
      setHighScore(score.toString());
      localStorage.setItem('snake-high-score', score.toString());
    }
    setShowMiniGame(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="border-b border-green-500/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎮</span>
            <h2 className="text-xl font-mono text-green-500">
              GAMING TERMINAL
            </h2>
          </div>
          <button
            onClick={() => setShowMiniGame(true)}
            className="tactical-button text-xs"
          >
            LAUNCH MINI-GAME
          </button>
        </div>
        <p className="text-gray-400 text-sm font-mono mt-2">
          Strategic gaming operations and recreational system status
        </p>
      </div>

      {/* Gaming Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xl font-mono text-green-500">
            {gamingSessions.filter(s => s.status === 'online').length}
          </div>
          <div className="text-xs font-mono text-gray-400">ONLINE</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-green-500">5</div>
          <div className="text-xs font-mono text-gray-400">PLATFORMS</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-green-500">1.9K</div>
          <div className="text-xs font-mono text-gray-400">TOTAL HOURS</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono text-green-500">{highScore}</div>
          <div className="text-xs font-mono text-gray-400">SNAKE HIGH</div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-3">
        {gamingSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="tactical-panel p-4 cursor-pointer hover:bg-green-500/5"
            onClick={() => setSelectedSession(session)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`status-dot ${session.status === 'online' ? 'active' : session.status === 'away' ? 'warning' : 'error'}`}></div>
                <div>
                  <div className="text-white font-mono text-sm">{session.game}</div>
                  <div className="text-gray-400 text-xs font-mono">{session.platform}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xs font-mono uppercase ${getStatusColor(session.status)}`}>
                  {session.status}
                </div>
                <div className="text-gray-500 text-xs font-mono">
                  {session.playtime} played
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-gray-300 text-xs font-mono">
              {session.currentActivity}
            </div>
            
            {session.achievement && (
              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <div className="text-yellow-500 text-xs font-mono">
                  🏆 {session.achievement}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mini-Game Modal */}
      <AnimatePresence>
        {showMiniGame && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SnakeGame 
              onComplete={handleMiniGameComplete}
              onClose={() => setShowMiniGame(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default GamingTerminal;