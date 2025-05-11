import { GameInfo } from '../types';

export const GAMES: GameInfo[] = [
  {
    id: 'free-fire',
    name: 'Free Fire',
    image: '/public/freefire.jpg',
    maxTeamSize: 4,
    isTeamGame: true
  },
  {
    id: 'bgmi',
    name: 'BGMI',
    image: '/public/bgmi.jpg',
    maxTeamSize: 4,
    isTeamGame: true
  },
  {
    id: 'valorant',
    name: 'Valorant',
    image: '/public/valorant.jpg',
    maxTeamSize: 5,
    isTeamGame: true
  },
  {
    id: 'call-of-duty',
    name: 'Call of Duty',
    image: '/public/cod.jpg',
    maxTeamSize: 4,
    isTeamGame: true
  }
];

export const DEFAULT_POSITION_POINTS = {
  1: 15,
  2: 12,
  3: 10,
  4: 8,
  5: 6,
  6: 4,
  7: 2,
  8: 1,
  9: 1,
  10: 1
};

export const DEFAULT_GAME_CONFIG = {
  killPoints: 1,
  positionPoints: DEFAULT_POSITION_POINTS
};