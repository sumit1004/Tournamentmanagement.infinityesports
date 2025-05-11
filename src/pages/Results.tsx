import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import ConfigLayout from '../components/layouts/ConfigLayout';
import { Trophy, Medal, Download, Trash2 } from 'lucide-react';

interface TeamResult {
  teamName: string;
  totalKills: number;
  totalPoints: number;
  matches: number;
}

interface MatchResult {
  name: string;
  type: 'semifinal' | 'final';
  teams: Array<{
    teamName: string;
    kills: number;
    position: number;
    points: number;
  }>;
}

const Results: React.FC = () => {
  const navigate = useNavigate();
  const [tournamentName, setTournamentName] = useState('');
  const [semifinalResults, setSemifinalResults] = useState<MatchResult[]>([]);
  const [finalResults, setFinalResults] = useState<MatchResult[]>([]);
  const [overallResults, setOverallResults] = useState<TeamResult[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    try {
      const config = JSON.parse(localStorage.getItem('globalGameConfig') || '{}');
      const gameId = localStorage.getItem('currentGameId');
      
      setTournamentName(config.tournamentName || 'Tournament');

      // Load all matches
      const savedMatches = JSON.parse(localStorage.getItem('allMatches') || '[]');
      
      const semis = savedMatches.filter((match: MatchResult) => match.type === 'semifinal');
      const finals = savedMatches.filter((match: MatchResult) => match.type === 'final');

      setSemifinalResults(semis);
      setFinalResults(finals);
      calculateOverallResults(savedMatches);
      
      // Save to persistent storage
      localStorage.setItem('persistentResults', JSON.stringify({
        tournamentName: config.tournamentName,
        matches: savedMatches,
        gameId
      }));
    } catch (error) {
      console.error('Error loading results:', error);
      alert('Failed to load tournament results');
    }
  };

  const calculateOverallResults = (savedMatches: MatchResult[]) => {
    const teamStats = new Map<string, TeamResult>();
    
    savedMatches.forEach((match: MatchResult) => {
      match.teams.forEach(team => {
        const existing = teamStats.get(team.teamName) || {
          teamName: team.teamName,
          totalKills: 0,
          totalPoints: 0,
          matches: 0
        };

        teamStats.set(team.teamName, {
          ...existing,
          totalKills: existing.totalKills + (team.kills || 0),
          totalPoints: existing.totalPoints + (team.points || 0),
          matches: existing.matches + 1
        });
      });
    });

    const sortedResults = Array.from(teamStats.values())
      .sort((a, b) => {
        // Sort by total points first, then by kills if points are equal
        if (b.totalPoints === a.totalPoints) {
          return b.totalKills - a.totalKills;
        }
        return b.totalPoints - a.totalPoints;
      });

    setOverallResults(sortedResults);
  };

  const downloadResults = () => {
    try {
      const workbook = utils.book_new();

      // Add semifinals sheet
      if (semifinalResults.length > 0) {
        const semiFinalsData = semifinalResults.flatMap((match, matchIndex) =>
          match.teams.map(team => ({
            'Match': `Semi-Final ${matchIndex + 1}`,
            'Team Name': team.teamName,
            'Position': team.position,
            'Kills': team.kills,
            'Total Points': team.points
          }))
        );
        const semiSheet = utils.json_to_sheet(semiFinalsData);
        utils.book_append_sheet(workbook, semiSheet, 'Semi Finals');
      }

      // Add finals sheet
      if (finalResults.length > 0) {
        const finalsData = finalResults.flatMap((match, matchIndex) =>
          match.teams.map(team => ({
            'Match': `Final ${matchIndex + 1}`,
            'Team Name': team.teamName,
            'Position': team.position,
            'Kills': team.kills,
            'Total Points': team.points
          }))
        );
        const finalSheet = utils.json_to_sheet(finalsData);
        utils.book_append_sheet(workbook, finalSheet, 'Finals');
      }

      // Add overall standings sheet
      const standingsData = overallResults.map((team, index) => ({
        'Rank': index + 1,
        'Team Name': team.teamName,
        'Total Kills': team.totalKills,
        'Total Points': team.totalPoints,
        'Matches Played': team.matches,
        'Average Points': (team.totalPoints / team.matches).toFixed(2)
      }));
      const standingsSheet = utils.json_to_sheet(standingsData);
      utils.book_append_sheet(workbook, standingsSheet, 'Overall Standings');

      // Download the file
      writeFile(workbook, `${tournamentName}_Tournament_Results.xlsx`);
    } catch (error) {
      console.error('Error downloading results:', error);
      alert('Failed to download results');
    }
  };

  const handleClearResults = () => {
    if (window.confirm('Are you sure you want to clear all results? This cannot be undone.')) {
      try {
        // Clear all tournament related data
        const gameId = localStorage.getItem('currentGameId');
        localStorage.removeItem('currentMatches');
        localStorage.removeItem(`teams_${gameId}`);
        localStorage.removeItem('currentGameId');
        localStorage.removeItem('teamNames');
        localStorage.removeItem('currentMatchData');
        localStorage.removeItem('persistentResults');
        localStorage.removeItem('globalGameConfig');
        
        // Reset states
        setSemifinalResults([]);
        setFinalResults([]);
        setOverallResults([]);
        
        navigate('/games');
      } catch (error) {
        console.error('Error clearing results:', error);
        alert('Failed to clear results');
      }
    }
  };

  const handleDeleteMatch = (matchType: 'semifinal' | 'final', matchIndex: number) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        const allMatches = JSON.parse(localStorage.getItem('allMatches') || '[]');
        const updatedMatches = allMatches.filter((match: MatchResult, idx: number) => {
          if (match.type === matchType) {
            return matchIndex !== allMatches.filter(m => m.type === matchType).indexOf(match);
          }
          return true;
        });

        localStorage.setItem('allMatches', JSON.stringify(updatedMatches));
        localStorage.setItem('currentMatches', JSON.stringify(updatedMatches));
        
        // Reload results
        loadResults();
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Failed to delete match');
      }
    }
  };

  const getPositionStyle = (position: number) => {
    switch(position) {
      case 0: return 'text-yellow-400'; // Gold
      case 1: return 'text-gray-300';   // Silver
      case 2: return 'text-amber-600';  // Bronze
      default: return 'text-gray-400';
    }
  };

  const handleSaveToHistory = () => {
    try {
      const historyData = JSON.parse(localStorage.getItem('tournamentHistory') || '[]');
      
      const tournamentData = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        name: tournamentName,
        semifinals: semifinalResults,
        finals: finalResults,
        standings: overallResults,
      };

      historyData.push(tournamentData);
      localStorage.setItem('tournamentHistory', JSON.stringify(historyData));
      alert('Tournament results saved to history!');
    } catch (error) {
      console.error('Error saving to history:', error);
      alert('Failed to save tournament to history');
    }
  };

  // Render match section helper
  const renderMatchSection = (matches: MatchResult[], title: string) => (
    matches.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-purple-400 mb-4">{title}</h2>
        {matches.map((match, matchIndex) => (
          <div key={matchIndex} className="mb-6 backdrop-blur-md bg-white/5 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-cyan-400">
                {match.name} ({match.type === 'semifinal' ? 'Semi-Final' : 'Final'})
              </h3>
              <button
                onClick={() => handleDeleteMatch(match.type, matchIndex)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Delete match"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {match.teams
                .sort((a, b) => b.points - a.points)
                .map((team, teamIndex) => (
                <div key={teamIndex} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">#{team.position || '-'}</span>
                    <span className="text-white">{team.teamName}</span>
                    <span className="text-gray-400">({team.kills || 0} kills)</span>
                  </div>
                  <span className="text-purple-400 font-bold">{team.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <ConfigLayout title={`${tournamentName} Results`}>
      <div className="px-4 sm:px-6 pb-24 sm:pb-6">
        {/* Header Actions - Mobile */}
        <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleSaveToHistory}
            className="bg-purple-500/20 border border-purple-500/20 hover:bg-purple-500/30 
            text-white p-3 rounded-lg flex items-center justify-center"
          >
            <Trophy size={18} className="mr-2" />
            Save History
          </button>
          <button
            onClick={downloadResults}
            className="bg-white/10 border border-white/20 hover:bg-white/20 
            text-white p-3 rounded-lg flex items-center justify-center"
          >
            <Download size={18} className="mr-2" />
            Download
          </button>
        </div>

        {/* Header Actions - Desktop */}
        <div className="hidden sm:flex justify-end space-x-4 mb-8">
          <button
            onClick={handleSaveToHistory}
            className="backdrop-blur-md bg-purple-500/20 border border-purple-500/20 
            hover:bg-purple-500/30 text-white px-6 py-3 rounded-lg flex items-center"
          >
            <Trophy size={18} className="mr-2" />
            Save to History
          </button>
          <button
            onClick={downloadResults}
            className="backdrop-blur-md bg-white/10 border border-white/20 
            hover:bg-white/20 text-white px-6 py-3 rounded-lg flex items-center"
          >
            <Download size={18} className="mr-2" />
            Download Results
          </button>
        </div>

        {/* Top 3 Teams Podium */}
        {overallResults.length > 0 && (
          <div className="relative h-64 sm:h-80 mb-8">
            {/* Second Place */}
            <div className="absolute left-4 sm:left-1/4 bottom-0 w-24 sm:w-48 flex flex-col items-center">
              <Trophy size={32} className="text-gray-300 mb-2" />
              <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-t-lg p-2 sm:p-4 text-center h-32 sm:h-48">
                <div className="text-sm sm:text-xl font-bold text-gray-300 truncate">
                  {overallResults[1]?.teamName}
                </div>
                <div className="text-lg sm:text-3xl font-bold text-purple-400">
                  {overallResults[1]?.totalPoints}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">points</div>
              </div>
            </div>

            {/* First Place */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-28 sm:w-56 flex flex-col items-center">
              <Trophy size={48} className="text-yellow-400 mb-2" />
              <div className="w-full bg-gradient-to-b from-purple-600 to-purple-800 rounded-t-lg p-2 sm:p-4 text-center h-40 sm:h-64">
                <div className="text-base sm:text-2xl font-bold text-white truncate">
                  {overallResults[0]?.teamName}
                </div>
                <div className="text-xl sm:text-4xl font-bold text-yellow-400">
                  {overallResults[0]?.totalPoints}
                </div>
                <div className="text-xs sm:text-sm text-white/80">points</div>
              </div>
            </div>

            {/* Third Place */}
            <div className="absolute right-4 sm:right-1/4 bottom-0 w-24 sm:w-48 flex flex-col items-center">
              <Trophy size={24} className="text-orange-400 mb-2" />
              <div className="w-full bg-gray-700/50 backdrop-blur-sm rounded-t-lg p-2 sm:p-4 text-center h-28 sm:h-40">
                <div className="text-sm sm:text-lg font-bold text-gray-300 truncate">
                  {overallResults[2]?.teamName}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-orange-400">
                  {overallResults[2]?.totalPoints}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">points</div>
              </div>
            </div>
          </div>
        )}

        {/* Match Results */}
        <div className="space-y-6">
          {/* Semi Finals */}
          {semifinalResults.length > 0 && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-purple-400 mb-4">Semi-Finals Results</h2>
              <div className="grid gap-4">
                {semifinalResults.map((match, matchIndex) => (
                  <div key={matchIndex} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-cyan-400">{match.name}</h3>
                      <button
                        onClick={() => handleDeleteMatch('semifinal', matchIndex)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="grid gap-2">
                      {match.teams
                        .sort((a, b) => b.points - a.points)
                        .map((team, teamIndex) => (
                          <div key={teamIndex} 
                            className="flex justify-between items-center bg-black/20 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-sm">#{team.position}</span>
                              <div>
                                <div className="text-white font-medium">{team.teamName}</div>
                                <div className="text-sm text-gray-400">{team.kills} kills</div>
                              </div>
                            </div>
                            <div className="text-purple-400 font-bold">{team.points} pts</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finals Results - Similar structure to Semi Finals */}
          {/* ...existing finals section with same styling as semifinals... */}

          {/* Overall Standings */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Overall Standings</h2>
            <div className="grid gap-3">
              {overallResults.map((team, index) => (
                <div key={team.teamName} 
                  className={`${
                    index < 3 ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/50' : 'bg-white/5'
                  } rounded-lg p-4`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <span className={`text-2xl font-bold ${getPositionStyle(index)}`}>
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="text-white font-semibold">{team.teamName}</h3>
                        <div className="flex gap-3 text-sm text-gray-400">
                          <span>{team.totalKills} kills</span>
                          <span>{team.matches} matches</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{team.totalPoints}</div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative bg-gray-900/80 backdrop-blur-md sm:bg-transparent border-t border-white/10 sm:border-0 p-4 sm:p-0">
          <div className="flex gap-3">
            <button
              onClick={handleClearResults}
              className="flex-1 sm:flex-none bg-red-500/20 hover:bg-red-500/30 text-white p-3 rounded-lg flex items-center justify-center"
            >
              <Trash2 size={18} className="mr-2" />
              Clear Results
            </button>
            <button
              onClick={() => navigate('/games')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-purple-800 text-white p-3 rounded-lg flex items-center justify-center"
            >
              New Tournament
            </button>
          </div>
        </div>
      </div>
    </ConfigLayout>
  );
};

export default Results;