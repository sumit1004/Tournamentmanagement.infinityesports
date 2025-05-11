import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import ConfigLayout from '../components/layouts/ConfigLayout';
import { Save, ChevronRight, Download, Trash2, Plus, Edit2 } from 'lucide-react';

interface TeamScore {
  teamName: string;
  kills: number | '';
  position: number | '';
  points: number;
}

interface Match {
  type: 'semifinal' | 'final';
  matchNumber: number;
  teams: TeamScore[];
}

const MatchCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [gameConfig, setGameConfig] = useState<any>(null);
  const [teams, setTeams] = useState<string[]>([]);
  const [editingMatch, setEditingMatch] = useState<number | null>(null);
  const [editMatchType, setEditMatchType] = useState<'semifinal' | 'final'>('final');
  const [editMatchNumber, setEditMatchNumber] = useState('');
  const [editingTeamName, setEditingTeamName] = useState<{
    matchIndex: number;
    teamIndex: number;
    name: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newMatchType, setNewMatchType] = useState<'semifinal' | 'final'>('final');
  const [newMatchNumber, setNewMatchNumber] = useState('');
  const [teamInput, setTeamInput] = useState('');
  const [teamList, setTeamList] = useState<string[]>([]);

  useEffect(() => {
    const loadSavedData = () => {
      const gameConf = JSON.parse(localStorage.getItem('globalGameConfig') || '{}');
      const teamNames = JSON.parse(localStorage.getItem('teamNames') || '[]');
      const savedMatches = localStorage.getItem('matchResults');
      
      setGameConfig(gameConf);
      setTeams(teamNames);

      if (savedMatches) {
        const parsedMatches = JSON.parse(savedMatches);
        // Recalculate points for all matches
        const updatedMatches = parsedMatches.map(match => ({
          ...match,
          teams: match.teams.map(team => ({
            ...team,
            points: calculatePointsForTeam(team.kills, team.position, gameConf)
          }))
        }));
        setMatches(updatedMatches);
        localStorage.setItem('matchResults', JSON.stringify(updatedMatches));
      } else {
        const initialMatch = {
          type: 'final',
          matchNumber: 1,
          teams: teamNames.map(name => ({
            teamName: name,
            kills: '',
            position: '',
            points: 0
          }))
        };
        setMatches([initialMatch]);
        localStorage.setItem('matchResults', JSON.stringify([initialMatch]));
      }
    };

    loadSavedData();
  }, []);

  const calculatePointsForTeam = (kills: number | '', position: number | '', config: any) => {
    if (!config || kills === '' || position === '') return 0;
    const killPoints = (Number(kills) || 0) * config.killPoints;
    const positionPoints = position > 0 ? config.positionPoints[position] || 0 : 0;
    return killPoints + positionPoints;
  };

  const handleScoreChange = (matchIndex: number, teamIndex: number, field: 'kills' | 'position', value: string) => {
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      const match = { ...newMatches[matchIndex] };
      const team = { ...match.teams[teamIndex] };

      team[field] = value === '' ? '' : Math.max(0, parseInt(value) || 0);
      team.points = calculatePointsForTeam(
        field === 'kills' ? (value === '' ? '' : parseInt(value)) : team.kills,
        field === 'position' ? (value === '' ? '' : parseInt(value)) : team.position,
        gameConfig
      );

      match.teams[teamIndex] = team;
      newMatches[matchIndex] = match;
      
      // Save to localStorage immediately
      localStorage.setItem('matchResults', JSON.stringify(newMatches));
      
      return newMatches;
    });
  };

  const handleSave = () => {
    // Recalculate all points before saving
    const finalMatches = matches.map(match => ({
      ...match,
      teams: match.teams.map(team => ({
        ...team,
        points: calculatePointsForTeam(team.kills, team.position, gameConfig)
      }))
    }));
    
    localStorage.setItem('matchResults', JSON.stringify(finalMatches));
    setMatches(finalMatches);
    navigate('/final-result');
  };

  const handleDeleteMatch = (matchIndex: number) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      setMatches(prevMatches => {
        const newMatches = prevMatches.filter((_, index) => index !== matchIndex);
        // If no matches left, add a default match
        if (newMatches.length === 0) {
          return [{
            type: 'final',
            matchNumber: 1,
            teams: teams.map(name => ({
              teamName: name,
              kills: '',
              position: '',
              points: 0
            }))
          }];
        }
        return newMatches;
      });
    }
  };

  const downloadMatchResult = (match: Match) => {
    const workbook = utils.book_new();
    const matchType = match.type === 'semifinal' ? 'Semi-Final' : 'Final';
    
    // Prepare data for Excel
    const matchData = match.teams
      .sort((a, b) => b.points - a.points)
      .map((team, index) => ({
        Position: index + 1,
        Team: team.teamName,
        Kills: team.kills || 0,
        'Place Points': team.position ? calculatePointsForTeam(0, team.position, gameConfig) : 0,
        'Kill Points': team.kills ? calculatePointsForTeam(team.kills, 0, gameConfig) : 0,
        'Total Points': team.points
      }));

    const worksheet = utils.json_to_sheet(matchData);
    utils.book_append_sheet(workbook, worksheet, `${matchType} ${match.matchNumber}`);
    
    writeFile(workbook, `${matchType}_${match.matchNumber}_Results.xlsx`);
  };

  const downloadAllResults = () => {
    try {
      const workbook = utils.book_new();
      
      // Add a summary sheet first
      const summaryData = matches.flatMap(match => 
        match.teams.map(team => ({
          'Match Type': match.type === 'semifinal' ? 'Semi-Final' : 'Final',
          'Match Number': match.matchNumber,
          'Team': team.teamName,
          'Kills': team.kills || 0,
          'Position': team.position || '-',
          'Kill Points': team.kills ? calculatePointsForTeam(team.kills, 0, gameConfig) : 0,
          'Position Points': team.position ? calculatePointsForTeam(0, team.position, gameConfig) : 0,
          'Total Points': team.points
        }))
      );
      const summarySheet = utils.json_to_sheet(summaryData);
      utils.book_append_sheet(workbook, summarySheet, 'All Matches Summary');

      // Add individual match sheets
      matches.forEach((match, index) => {
        const matchType = match.type === 'semifinal' ? 'Semi-Final' : 'Final';
        const sheetName = `${matchType} ${match.matchNumber}`;
        
        const matchData = [...match.teams]
          .sort((a, b) => b.points - a.points)
          .map((team, position) => ({
            'Rank': position + 1,
            'Team': team.teamName,
            'Kills': team.kills || 0,
            'Position': team.position || '-',
            'Kill Points': team.kills ? calculatePointsForTeam(team.kills, 0, gameConfig) : 0,
            'Position Points': team.position ? calculatePointsForTeam(0, team.position, gameConfig) : 0,
            'Total Points': team.points
          }));

        const matchSheet = utils.json_to_sheet(matchData);
        utils.book_append_sheet(workbook, matchSheet, sheetName);
      });

      // Get tournament name if available
      const tournamentConfig = JSON.parse(localStorage.getItem('tournamentConfig') || '{}');
      const fileName = tournamentConfig.tournamentName 
        ? `${tournamentConfig.tournamentName}_All_Matches.xlsx`
        : 'Tournament_All_Matches.xlsx';

      writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error downloading results:', error);
      alert('Failed to download results');
    }
  };

  const handleRenameMatch = (matchIndex: number) => {
    const match = matches[matchIndex];
    setEditingMatch(matchIndex);
    setEditMatchType(match.type);
    setEditMatchNumber(match.matchNumber.toString());
  };

  const handleSaveRename = (matchIndex: number) => {
    if (!editMatchNumber.trim()) {
      alert('Please enter match number');
      return;
    }

    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      newMatches[matchIndex] = {
        ...newMatches[matchIndex],
        type: editMatchType,
        matchNumber: parseInt(editMatchNumber)
      };
      return newMatches;
    });

    setEditingMatch(null);
  };

  const handleTeamNameEdit = (matchIndex: number, teamIndex: number, currentName: string) => {
    setEditingTeamName({ matchIndex, teamIndex, name: currentName });
  };

  const handleTeamNameSave = () => {
    if (!editingTeamName) return;

    const newName = editingTeamName.name.trim();
    if (!newName) {
      setEditingTeamName(null);
      return;
    }

    // Update matches
    setMatches(prevMatches => {
      const newMatches = [...prevMatches];
      newMatches.forEach(match => {
        match.teams = match.teams.map((team, idx) => {
          if (team.teamName === matches[editingTeamName.matchIndex].teams[editingTeamName.teamIndex].teamName) {
            return { ...team, teamName: newName };
          }
          return team;
        });
      });
      
      // Save updated matches to localStorage
      localStorage.setItem('matchResults', JSON.stringify(newMatches));
      return newMatches;
    });

    // Update teams array
    setTeams(prevTeams => {
      const oldName = matches[editingTeamName.matchIndex].teams[editingTeamName.teamIndex].teamName;
      const newTeams = prevTeams.map(team => team === oldName ? newName : team);
      // Save updated teams to localStorage
      localStorage.setItem('teamNames', JSON.stringify(newTeams));
      return newTeams;
    });

    setEditingTeamName(null);
  };

  const handleAddTeam = () => {
    if (!teamInput.trim()) return;
    
    const newTeam = teamInput.trim();
    setTeamList(prev => [...prev, newTeam]);
    setTeamInput('');
  };

  const handleAddMatch = () => {
    if (!teamList.length) {
      alert('Please add at least one team first');
      return;
    }

    if (!newMatchNumber.trim()) {
      alert('Please enter match number');
      return;
    }

    // Save teams to localStorage
    localStorage.setItem('teamNames', JSON.stringify(teamList));
    
    const newMatch: Match = {
      type: newMatchType,
      matchNumber: parseInt(newMatchNumber),
      teams: teamList.map(name => ({
        teamName: name,
        kills: '',
        position: '',
        points: 0
      }))
    };

    setMatches(prev => {
      const newMatches = [...prev, newMatch];
      // Save to localStorage with the new match
      localStorage.setItem('matchResults', JSON.stringify(newMatches));
      return newMatches;
    });

    // Update local state with the latest data
    setTeams(teamList);
    setGameConfig(JSON.parse(localStorage.getItem('globalGameConfig') || '{}'));
    setShowModal(false);
    setNewMatchNumber('');
    setNewMatchType('final');
  };

  return (
    <ConfigLayout title="Match Calculator">
      <div className="relative min-h-screen pb-20 sm:pb-0 px-2 sm:px-6">
        {/* Add Match Button - Hide on mobile */}
        <div className="hidden sm:block absolute top-[-60px] right-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 py-2 rounded-md"
          >
            <Plus size={18} className="mr-2" />
            Add Match
          </button>
        </div>

        {/* Existing matches */}
        <div className="mt-4">
          {matches.map((match, matchIndex) => (
            <div key={matchIndex} className="mb-6">
              {/* Match Header */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex justify-between items-center">
                  {editingMatch === matchIndex ? (
                    <div className="flex flex-col w-full gap-2">
                      <select
                        value={editMatchType}
                        onChange={(e) => setEditMatchType(e.target.value as 'semifinal' | 'final')}
                        className="bg-white/5 text-white p-2 rounded-md w-full"
                      >
                        <option value="semifinal">Semi-Final</option>
                        <option value="final">Final</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editMatchNumber}
                          onChange={(e) => setEditMatchNumber(e.target.value)}
                          className="bg-white/5 text-white p-2 rounded flex-1"
                          min="1"
                          placeholder="Match #"
                        />
                        <button
                          onClick={() => handleSaveRename(matchIndex)}
                          className="bg-green-600 px-4 rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-2xl font-bold text-purple-400">
                        {match.type === 'semifinal' ? 'Semi-Final' : 'Final'} #{match.matchNumber}
                      </h2>
                      <button
                        onClick={() => handleRenameMatch(matchIndex)}
                        className="p-1.5 rounded-full bg-blue-600/20 text-blue-400"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteMatch(matchIndex)}
                    className="p-2 text-red-400 hover:bg-red-400/20 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Match Content */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-3 sm:p-6">
                {/* Mobile View */}
                <div className="sm:hidden space-y-3">
                  {match.teams.map((team, teamIndex) => (
                    <div key={teamIndex} className="bg-black/20 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-purple-400 flex items-center gap-2">
                          {editingTeamName?.matchIndex === matchIndex && 
                          editingTeamName?.teamIndex === teamIndex ? (
                            <input
                              type="text"
                              value={editingTeamName.name}
                              onChange={(e) => setEditingTeamName({
                                ...editingTeamName,
                                name: e.target.value
                              })}
                              className="bg-white/5 text-white p-1 rounded w-full"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTeamNameSave();
                                if (e.key === 'Escape') setEditingTeamName(null);
                              }}
                            />
                          ) : (
                            <>
                              <span>{team.teamName}</span>
                              <button
                                onClick={() => handleTeamNameEdit(matchIndex, teamIndex, team.teamName)}
                                className="text-gray-400"
                              >
                                <Edit2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                        <div className="text-cyan-400 text-lg font-semibold">{team.points}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400">Kills</label>
                          <input
                            type="number"
                            value={team.kills === '' ? '' : team.kills}
                            onChange={(e) => handleScoreChange(matchIndex, teamIndex, 'kills', e.target.value)}
                            className="bg-white/5 text-white p-2 rounded w-full"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Position</label>
                          <input
                            type="number"
                            value={team.position === '' ? '' : team.position}
                            onChange={(e) => handleScoreChange(matchIndex, teamIndex, 'position', e.target.value)}
                            className="bg-white/5 text-white p-2 rounded w-full"
                            min="1"
                            max={teams.length}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 font-semibold text-gray-300">
                    <div>Team Name</div>
                    <div>Kills</div>
                    <div>Position</div>
                    <div>Points</div>
                  </div>

                  {match.teams.map((team, teamIndex) => (
                    <div key={teamIndex} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 sm:mb-2">
                      <div className="text-purple-400 flex items-center">
                        {editingTeamName?.matchIndex === matchIndex && 
                        editingTeamName?.teamIndex === teamIndex ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingTeamName.name}
                              onChange={(e) => setEditingTeamName({
                                ...editingTeamName,
                                name: e.target.value
                              })}
                              className="bg-white/5 text-white p-2 rounded"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTeamNameSave();
                                if (e.key === 'Escape') setEditingTeamName(null);
                              }}
                            />
                            <button
                              onClick={handleTeamNameSave}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 rounded"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{team.teamName}</span>
                            <button
                              onClick={() => handleTeamNameEdit(matchIndex, teamIndex, team.teamName)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <input
                        type="number"
                        value={team.kills === '' ? '' : team.kills}
                        onChange={(e) => handleScoreChange(matchIndex, teamIndex, 'kills', e.target.value)}
                        className="bg-white/5 text-white p-2 rounded"
                        min="0"
                        placeholder="Kills"
                      />
                      <input
                        type="number"
                        value={team.position === '' ? '' : team.position}
                        onChange={(e) => handleScoreChange(matchIndex, teamIndex, 'position', e.target.value)}
                        className="bg-white/5 text-white p-2 rounded"
                        min="1"
                        max={teams.length}
                        placeholder="Position"
                      />
                      <div className="text-cyan-400">{team.points}</div>
                    </div>
                  ))}
                </div>

                {/* Match Results Section */}
                <div className="mt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-purple-400">Match Results</h3>
                    <button
                      onClick={() => downloadMatchResult(match)}
                      className="flex items-center bg-gradient-to-r from-purple-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md w-full sm:w-auto justify-center"
                    >
                      <Download size={16} className="mr-1 sm:mr-2" />
                      Download Match Result
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="text-gray-300">
                          <th className="text-left">Position</th>
                          <th className="text-left">Team</th>
                          <th className="text-left">Kills</th>
                          <th className="text-left">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...match.teams]
                          .sort((a, b) => b.points - a.points)
                          .map((team, index) => (
                            <tr key={index} className="text-white">
                              <td>{index + 1}</td>
                              <td>{team.teamName}</td>
                              <td>{team.kills}</td>
                              <td>{team.points}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-gray-900 border-t border-white/10 p-4">
          <div className="flex justify-between gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-md text-sm flex items-center justify-center"
            >
              <Plus size={16} className="mr-1" />
              Add Match
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-3 rounded-md text-sm flex items-center justify-center"
            >
              Show Results
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Add New Match</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Teams</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={teamInput}
                      onChange={(e) => setTeamInput(e.target.value)}
                      className="flex-1 bg-white/5 text-white p-2 rounded-md"
                      placeholder="Enter team name"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                    />
                    <button
                      onClick={handleAddTeam}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                    >
                      Add Team
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-white/5 rounded-md p-2">
                    {teamList.map((team, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-white">{team}</span>
                        <button
                          onClick={() => setTeamList(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Match Type</label>
                  <select
                    value={newMatchType}
                    onChange={(e) => setNewMatchType(e.target.value as 'semifinal' | 'final')}
                    className="w-full bg-white/5 text-white p-2 rounded-md"
                  >
                    <option value="semifinal">Semi-Final</option>
                    <option value="final">Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Match Number</label>
                  <input
                    type="number"
                    value={newMatchNumber}
                    onChange={(e) => setNewMatchNumber(e.target.value)}
                    className="w-full bg-white/5 text-white p-2 rounded-md"
                    placeholder="Enter match number"
                    min="1"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMatch}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
                  >
                    Add Match
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 px-4 sm:px-6">
        <button
          onClick={downloadAllResults}
          className="flex items-center bg-cyan-600 hover:bg-cyan-700 text-white px-4 sm:px-6 py-3 rounded-md justify-center"
        >
          <Download size={16} className="mr-1 sm:mr-2" />
          Download All Matches
        </button>
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-4 sm:px-6 py-3 rounded-md flex items-center justify-center"
        >
          <Save size={16} className="mr-1 sm:mr-2" />
          Show Final Result
          <ChevronRight size={16} className="ml-1 sm:ml-2" />
        </button>
      </div>
    </ConfigLayout>
  );
};

export default MatchCalculator;
