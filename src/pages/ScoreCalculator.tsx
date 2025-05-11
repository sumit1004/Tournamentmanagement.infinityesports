import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigLayout from '../components/layouts/ConfigLayout';
import { Save, Calculator, Trash2 } from 'lucide-react';

interface TeamScore {
  teamName: string;
  kills: number;
  position: number;
  totalPoints: number;
}

const ScoreCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamScore[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [matchType, setMatchType] = useState<'semifinal' | 'final'>('semifinal');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchName, setMatchName] = useState<string>('Match 1');
  const [allMatches, setAllMatches] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load saved matches
        const savedMatches = JSON.parse(localStorage.getItem('allMatches') || '[]');
        setAllMatches(savedMatches);

        // Load configuration
        const savedConfig = JSON.parse(localStorage.getItem('globalGameConfig') || '{}');
        if (!savedConfig.positionPoints) {
          throw new Error('Game configuration not found. Please set up the game first.');
        }
        setConfig(savedConfig);

        // Load teams data
        const currentTeams = localStorage.getItem('currentTeams');
        if (currentTeams) {
          setTeams(JSON.parse(currentTeams));
        } else {
          const teamNames = JSON.parse(localStorage.getItem('teamNames') || '[]');
          const initialTeams = teamNames.map((name: string) => ({
            teamName: name,
            kills: 0,
            position: 0,
            totalPoints: 0
          }));
          setTeams(initialTeams);
          localStorage.setItem('currentTeams', JSON.stringify(initialTeams));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update local storage whenever teams change
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem('currentTeams', JSON.stringify(teams));
    }
  }, [teams]);

  const calculateScore = (team: TeamScore) => {
    if (!config || !config.positionPoints) return 0;
    
    const killPoints = (team.kills || 0) * (config.killPoints || 0);
    const position = parseInt(team.position?.toString() || '0');
    let positionPoints = 0;

    // Check if position exists in config and is valid
    if (position > 0 && config.positionPoints[position]) {
      positionPoints = parseInt(config.positionPoints[position].toString()) || 0;
    }
    
    return killPoints + positionPoints;
  };

  const updateTeamPoints = (teamIndex: number, updates: Partial<TeamScore>) => {
    setTeams(prevTeams => {
      const newTeams = [...prevTeams];
      newTeams[teamIndex] = {
        ...newTeams[teamIndex],
        ...updates
      };
      // Calculate and update total points
      newTeams[teamIndex].totalPoints = calculateScore(newTeams[teamIndex]);
      return newTeams;
    });
  };

  const handleKillsChange = (index: number, kills: number) => {
    updateTeamPoints(index, {
      kills: Math.max(0, isNaN(kills) ? 0 : kills)
    });
  };

  const handlePositionChange = (index: number, position: number) => {
    if (!config?.maxPositions) return;

    const validPosition = Math.max(0, Math.min(position, config.maxPositions));
    
    // Check if position is already taken
    const isPositionTaken = teams.some((t, i) => 
      i !== index && t.position === validPosition && validPosition !== 0
    );

    if (isPositionTaken) {
      alert(`Position ${validPosition} is already taken by another team`);
      return;
    }

    updateTeamPoints(index, { position: validPosition });
  };

  // Add position points display
  const getPositionPoints = (position: number) => {
    if (!config || !config.positionPoints || !position) return 0;
    return parseInt(config.positionPoints[position]?.toString() || '0');
  };

  const handleAddMatch = () => {
    // Validate current match
    const invalidTeams = teams.filter(t => !t.position || t.position === 0);
    if (invalidTeams.length > 0) {
      alert('Please complete current match scores before adding new match');
      return;
    }

    // Save current match
    const currentMatch = {
      name: matchName,
      type: matchType,
      teams: teams.map(team => ({
        teamName: team.teamName,
        kills: parseInt(team.kills.toString()) || 0,
        position: parseInt(team.position.toString()),
        points: calculateScore(team)
      }))
    };

    // Add to matches array
    const updatedMatches = [...allMatches, currentMatch];
    setAllMatches(updatedMatches);
    localStorage.setItem('allMatches', JSON.stringify(updatedMatches));

    // Reset for new match
    setMatchName(`Match ${updatedMatches.length + 1}`);
    setTeams(teams.map(team => ({
      ...team,
      kills: 0,
      position: 0,
      totalPoints: 0
    })));
  };

  const handleSave = () => {
    // Validate all teams have positions
    const invalidTeams = teams.filter(t => !t.position || t.position === 0);
    if (invalidTeams.length > 0) {
      alert('All teams must have a valid position');
      return;
    }

    // Validate positions are unique and within range
    const positions = teams.map(t => t.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== teams.length) {
      alert('Each team must have a unique position');
      return;
    }

    const maxAllowedPosition = config?.maxPositions || 1;
    if (positions.some(p => p > maxAllowedPosition)) {
      alert(`Positions must be between 1 and ${maxAllowedPosition}`);
      return;
    }

    const matchResults = {
      name: matchName,
      type: matchType,
      teams: teams.map(team => ({
        teamName: team.teamName,
        kills: parseInt(team.kills.toString()) || 0,
        position: parseInt(team.position.toString()),
        points: calculateScore(team)
      }))
    };

    try {
      const updatedMatches = [...allMatches, matchResults];
      localStorage.setItem('allMatches', JSON.stringify(updatedMatches));
      localStorage.setItem('currentMatches', JSON.stringify(updatedMatches));
      localStorage.removeItem('currentMatchData');
      
      navigate('/results');
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Failed to save match results');
    }
  };

  const handleDeleteMatch = (index: number) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      const updatedMatches = allMatches.filter((_, idx) => idx !== index);
      setAllMatches(updatedMatches);
      localStorage.setItem('allMatches', JSON.stringify(updatedMatches));
      localStorage.setItem('currentMatches', JSON.stringify(updatedMatches));
    }
  };

  const handleEditMatch = (match: any) => {
    setMatchType(match.type);
    setMatchName(match.name);
    setTeams(match.teams.map((team: any) => ({
      teamName: team.teamName,
      kills: team.kills,
      position: team.position,
      totalPoints: team.points
    })));
  };

  if (isLoading) {
    return <ConfigLayout title="Loading...">
      <div className="text-center text-white">Loading configuration...</div>
    </ConfigLayout>;
  }

  if (error) {
    return <ConfigLayout title="Error">
      <div className="text-center text-red-500">{error}</div>
      <button
        onClick={() => navigate('/games')}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
      >
        Return to Games
      </button>
    </ConfigLayout>;
  }

  return (
    <ConfigLayout title="Calculate Match Scores">
      <div className="px-4 sm:px-6 pb-24 sm:pb-6">
        {/* Match Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as 'semifinal' | 'final')}
            className="bg-white/5 text-white p-3 rounded-lg flex-1 sm:flex-none"
          >
            <option value="semifinal">Semi Final</option>
            <option value="final">Final</option>
          </select>

          <input
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            className="bg-white/5 text-white p-3 rounded-lg flex-1"
            placeholder="Match Name"
          />

          <button
            onClick={handleAddMatch}
            className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg whitespace-nowrap"
          >
            Add Match
          </button>
        </div>

        {/* Previous Matches */}
        {allMatches.length > 0 && (
          <div className="mb-8 space-y-4">
            <h3 className="text-xl font-bold text-purple-400">Previous Matches</h3>
            <div className="space-y-4">
              {allMatches.map((match, idx) => (
                <div key={idx} className="backdrop-blur-md bg-white/5 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                    <div>
                      <span className="text-cyan-400 text-lg font-semibold">{match.name}</span>
                      <span className="text-gray-400 ml-2">({match.type})</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMatch(match)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-white px-4 py-2 rounded-lg flex-1 sm:flex-none"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(idx)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg flex-1 sm:flex-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {match.teams
                      .sort((a: any, b: any) => b.points - a.points)
                      .map((team: any, teamIdx: number) => (
                        <div key={teamIdx} className="bg-white/5 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-sm">#{team.position}</span>
                              <span className="text-white font-medium">{team.teamName}</span>
                            </div>
                            <span className="text-cyan-400 font-bold">{team.points} pts</span>
                          </div>
                          <div className="text-gray-400 text-sm mt-1">
                            {team.kills} kills ({team.kills * (config?.killPoints || 0)} pts)
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Match */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 sm:p-6 mb-20 sm:mb-8">
          <h3 className="text-xl font-bold text-purple-400 mb-4">
            {matchName} ({matchType})
          </h3>
          <div className="space-y-4">
            {teams.map((team, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-purple-400 font-semibold">{team.teamName}</div>
                  <div className="text-cyan-400 font-bold">
                    {team.totalPoints} pts
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <label className="text-gray-400 text-sm block mb-1">Kills</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={team.kills || 0}
                        onChange={(e) => handleKillsChange(index, parseInt(e.target.value))}
                        className="bg-white/10 text-white p-2 rounded w-20"
                        min="0"
                      />
                      <span className="text-gray-400 text-sm">
                        ({(team.kills || 0) * (config?.killPoints || 0)} pts)
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3">
                    <label className="text-gray-400 text-sm block mb-1">Position</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={team.position || ''}
                        onChange={(e) => handlePositionChange(index, parseInt(e.target.value))}
                        className="bg-white/10 text-white p-2 rounded w-20"
                        min="1"
                        max={config?.maxPositions || 1}
                        placeholder="Pos"
                      />
                      <span className="text-gray-400 text-sm">
                        ({getPositionPoints(team.position)} pts)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative bg-gray-900/80 backdrop-blur-md sm:bg-transparent border-t border-white/10 sm:border-0 p-4 sm:p-0">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={() => navigate('/tournament-config')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 
              text-white px-6 py-3 rounded-lg flex items-center justify-center w-full sm:w-auto"
            >
              <Calculator className="mr-2" />
              Save Results
            </button>
          </div>
        </div>
      </div>
    </ConfigLayout>
  );
};

export default ScoreCalculator;
