import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../data/games';
import { saveSelectedGame } from '../utils/storage';
import { Gamepad as GameplaySolid, Trophy, Users, Zap, History } from 'lucide-react';
import '../styles/typing.css';

const Games: React.FC = () => {
  const navigate = useNavigate();

  const handleGameSelect = (gameIndex: number) => {
    const selectedGame = GAMES[gameIndex];
    saveSelectedGame(selectedGame);
    navigate(`/${selectedGame.id}/config`);
  };

  return (
    <div className="min-h-screen relative text-gray-100 p-6">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: 'url("/background.jpg")',
          zIndex: -1 
        }} 
      />
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: -1 }} />
      <div className="relative max-w-[95%] mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20 mb-4 transform hover:scale-105 transition-all duration-300">
            <img 
              src="/logo.png" 
              alt="Infinity Esports Logo" 
              className="w-50 h-28 animate-pulse drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />
          </div>
          <div className="flex items-center justify-center">
            <Zap className="h-10 w-10 text-purple-500 mr-3 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 animate-pulse hover:scale-105 transition-transform duration-300">
              Infinity Esports
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 mb-12 typing-text w-fit">
            Choose a Game to Manage<span className="dots-animation"></span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-6 justify-items-center place-items-center ml-8">
          {GAMES.map((game, index) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(index)}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 animate-fadeIn w-[200px]"
              style={{
                animationDelay: `${index * 200}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <div className="flex flex-col items-center text-center">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-20 h-16 rounded-lg mb-3 object-cover"
                />
                <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-30 rounded-full mb-3">
                  <GameplaySolid className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                <div className="flex space-x-2 text-xs opacity-80">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {game.maxTeamSize}
                  </span>
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Ranking
                  </span>
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={() => navigate('/all-games-config')}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 animate-fadeIn w-[200px]"
            style={{
              animationDelay: `${(GAMES.length) * 200}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-r from-purple-500 to-cyan-400">
                <GameplaySolid className="h-8 w-8 text-white" />
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-30 rounded-full mb-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">All Games</h3>
              <div className="flex space-x-2 text-xs opacity-80">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  All Teams
                </span>
                <span className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  Overview
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/tournament-history')}
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 animate-fadeIn w-[200px]"
            style={{
              animationDelay: `${(GAMES.length + 1) * 200}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-16 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-r from-purple-500 to-cyan-400">
                <History className="h-8 w-8 text-white" />
              </div>
              <div className="w-12 h-12 flex items-center justify-center bg-black bg-opacity-30 rounded-full mb-3">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">History</h3>
              <div className="flex space-x-2 text-xs opacity-80">
                <span className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  Past Results
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Statistics
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Games;