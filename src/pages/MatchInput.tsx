import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAMES } from '../data/games';
import { Team, MatchResult, GameConfig } from '../types';
import { getTeams, getGameConfig, saveMatchResults, getMatchResults } from '../utils/storage';
import { calculatePoints } from '../utils/calculations';
import { Save, SkipForward, ArrowLeft, Award } from 'lucide-react';

const MatchInput: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Find the game based on the gameId
  const game = GAMES.find(g => g.id === gameId);
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    killPoints: 1,
    positionPoints: {}
  });

  useEffect(() => {
    if (gameId) {
      // Load teams, game config, and existing match results
      const savedTeams = getTeams(gameId);
      const savedConfig = getGameConfig(gameId);
      const savedResults = getMatchResults(gameId);
      
      console.log('Loaded teams:', savedTeams); // Debug log

      if (!savedTeams || savedTeams.length === 0) {
        console.error('No teams found for game:', gameId);
        navigate(`/${gameId}/register`);
        return;
      }

      setTeams(savedTeams);
      setGameConfig(savedConfig);
      
      // Initialize results with saved data or create new results for all teams
      if (savedResults && savedResults.length > 0) {
        // Ensure all teams have results
        const allResults = savedTeams.map(team => {
          const existingResult = savedResults.find(r => r.teamId === team.id);
          return existingResult || {
            teamId: team.id,
            kills: 0,
            position: 0,
            points: 0
          };
        });
        setResults(allResults);
      } else {
        // Create new results for all teams
        const initialResults = savedTeams.map(team => ({
          teamId: team.id,
          kills: 0,
          position: 0,
          points: 0
        }));
        setResults(initialResults);
      }
    }
  }, [gameId, navigate]);

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Game not found. Please return to the game selection.</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-purple-500">No Teams Registered</h1>
          <p className="text-gray-400 mb-8">
            Please register teams before entering match results.
          </p>
        </div>
        <button
          onClick={() => navigate(`/${gameId}/register`)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
        >
          Go to Team Registration
        </button>
      </div>
    );
  }

  const handleKillsChange = (teamId: string, kills: number) => {
    setResults(prev => {
      return prev.map(result => {
        if (result.teamId === teamId) {
          const updatedResult = {
            ...result,
            kills: Math.max(0, kills)
          };
          // Recalculate points
          updatedResult.points = calculatePoints(updatedResult.kills, updatedResult.position, gameConfig);
          return updatedResult;
        }
        return result;
      });
    });
  };

  const handlePositionChange = (teamId: string, position: number) => {
    setResults(prev => {
      return prev.map(result => {
        if (result.teamId === teamId) {
          const updatedResult = {
            ...result,
            position: Math.max(0, position)
          };
          // Recalculate points
          updatedResult.points = calculatePoints(updatedResult.kills, updatedResult.position, gameConfig);
          return updatedResult;
        }
        return result;
      });
    });
  };

  const calculateAllPoints = () => {
    setResults(prev => {
      return prev.map(result => ({
        ...result,
        points: calculatePoints(result.kills, result.position, gameConfig)
      }));
    });
  };

  const handleSaveResults = () => {
    if (gameId) {
      // Calculate final points before saving
      const updatedResults = results.map(result => ({
        ...result,
        points: calculatePoints(result.kills, result.position, gameConfig)
      }));
      
      saveMatchResults(gameId, updatedResults);
      navigate(`/${gameId}/results`);
    }
  };

  // Create a map to lookup team by ID
  const teamsMap = teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {} as Record<string, Team>);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
          {game.name} Match Results
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Enter each team's kills and final position
        </p>

        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Kills</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Points</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const team = teamsMap[result.teamId];
                  if (!team) return null;
                  
                  return (
                    <tr key={result.teamId} className="border-b border-gray-700">
                      <td className="py-3 px-4">
                        <div className="font-medium">{team.teamName}</div>
                        <div className="text-sm text-gray-400">
                          {team.members.map(m => m.fullName).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          value={result.kills}
                          onChange={(e) => handleKillsChange(result.teamId, parseInt(e.target.value) || 0)}
                          className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          value={result.position || ''}
                          onChange={(e) => handlePositionChange(result.teamId, parseInt(e.target.value) || 0)}
                          className="w-20 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="#"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-purple-300">
                          {result.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={calculateAllPoints}
              className="flex items-center bg-indigo-700 hover:bg-indigo-600 px-6 py-3 rounded-md text-white transition-colors"
            >
              <Award size={20} className="mr-2" />
              Calculate Points
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <button
            onClick={() => navigate(`/${gameId}/register`)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md flex items-center transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Teams
          </button>

          <button
            onClick={handleSaveResults}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-6 py-3 rounded-md flex items-center transition-all hover:shadow-lg"
          >
            <Save size={18} className="mr-2" />
            Save & View Results
            <SkipForward size={18} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchInput;