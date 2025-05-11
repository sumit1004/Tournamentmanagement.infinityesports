import { GameConfig, MatchResult, Team } from '../types';

export const calculatePoints = (
  kills: number, 
  position: number, 
  config: GameConfig
): number => {
  const killScore = kills * config.killPoints;
  
  // Get position points if exists, otherwise 0
  const positionScore = position in config.positionPoints 
    ? config.positionPoints[position] 
    : 0;
  
  return killScore + positionScore;
};

export const calculateTeamResults = (
  teams: Team[],
  results: MatchResult[]
): MatchResult[] => {
  // Create a map for quick team lookup
  const teamsMap = teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {} as Record<string, Team>);
  
  // Sort results by points (descending)
  const sortedResults = [...results].sort((a, b) => b.points - a.points);
  
  // Add rank information
  return sortedResults.map((result, index) => ({
    ...result,
    rank: index + 1
  }));
};