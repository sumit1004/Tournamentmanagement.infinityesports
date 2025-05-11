import { AppState, GameConfig, GameInfo, MatchResult, Team } from '../types';
import { DEFAULT_GAME_CONFIG } from '../data/games';

// Game Config Storage
export const saveGameConfig = (gameId: string, config: GameConfig): void => {
  const storedConfigs = localStorage.getItem('gameConfigs');
  const configs = storedConfigs ? JSON.parse(storedConfigs) : {};
  
  configs[gameId] = config;
  localStorage.setItem('gameConfigs', JSON.stringify(configs));
};

export const getGameConfig = (gameId: string): GameConfig => {
  const storedConfigs = localStorage.getItem('gameConfigs');
  const configs = storedConfigs ? JSON.parse(storedConfigs) : {};
  
  return configs[gameId] || DEFAULT_GAME_CONFIG;
};

// Teams Storage
export const saveTeams = (gameId: string, teams: Team[]): void => {
  const storedTeams = localStorage.getItem('teams');
  const allTeams = storedTeams ? JSON.parse(storedTeams) : {};
  
  allTeams[gameId] = teams;
  localStorage.setItem('teams', JSON.stringify(allTeams));
};

export const getTeams = (gameId: string): Team[] => {
  const storedTeams = localStorage.getItem('teams');
  const allTeams = storedTeams ? JSON.parse(storedTeams) : {};
  
  return allTeams[gameId] || [];
};

// Match Results Storage
export const saveMatchResults = (gameId: string, results: MatchResult[]): void => {
  const storedResults = localStorage.getItem('matchResults');
  const allResults = storedResults ? JSON.parse(storedResults) : {};
  
  allResults[gameId] = results;
  localStorage.setItem('matchResults', JSON.stringify(allResults));
};

export const getMatchResults = (gameId: string): MatchResult[] => {
  const storedResults = localStorage.getItem('matchResults');
  const allResults = storedResults ? JSON.parse(storedResults) : {};
  
  return allResults[gameId] || [];
};

// Selected Game Storage
export const saveSelectedGame = (game: GameInfo): void => {
  localStorage.setItem('selectedGame', JSON.stringify(game));
};

export const getSelectedGame = (): GameInfo | null => {
  const storedGame = localStorage.getItem('selectedGame');
  return storedGame ? JSON.parse(storedGame) : null;
};

// Clear all game data
export const clearGameData = (gameId: string): void => {
  // Clear teams
  const storedTeams = localStorage.getItem('teams');
  if (storedTeams) {
    const allTeams = JSON.parse(storedTeams);
    delete allTeams[gameId];
    localStorage.setItem('teams', JSON.stringify(allTeams));
  }
  
  // Clear match results
  const storedResults = localStorage.getItem('matchResults');
  if (storedResults) {
    const allResults = JSON.parse(storedResults);
    delete allResults[gameId];
    localStorage.setItem('matchResults', JSON.stringify(allResults));
  }
};