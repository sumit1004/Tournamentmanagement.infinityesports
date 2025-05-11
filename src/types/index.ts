export interface Team {
  id: string;
  teamName: string;
  members: Player[];
}

export interface Player {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  erpId: string;
  branch: string;
  collegeName: string;
}

export interface GameConfig {
  killPoints: number;
  positionPoints: { [key: number]: number };
}

export interface MatchResult {
  teamId: string;
  kills: number;
  position: number;
  points: number;
}

export type GameType = 'Free Fire' | 'BGMI' | 'Valorant' | 'Call of Duty';

export interface GameInfo {
  id: string;
  name: GameType;
  image: string;
  maxTeamSize: number;
  isTeamGame: boolean;
}

export interface AppState {
  selectedGame: GameInfo | null;
  gameConfig: Record<string, GameConfig>;
  teams: Record<string, Team[]>;
  matchResults: Record<string, MatchResult[]>;
}