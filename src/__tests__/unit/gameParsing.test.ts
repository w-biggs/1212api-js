import { parseHomeAway, parseTeamStats, parseTeamScores } from '../../tasks/parseGameThread';
import mockGameJSON from './mockGameJSON.json';

test('finds home/away with records and rankings', () => {
  expect(parseHomeAway('[GAME THREAD] #13 (5-1) Ball State @ #21 (4-2) Kent State')).toEqual({
    homeTeam: 'Kent State',
    awayTeam: 'Ball State'
  })
});

test('finds home/away with records and no rankings', () => {
  expect(parseHomeAway('[GAME THREAD] (5-1) Ball State @ (4-2) Kent State')).toEqual({
    homeTeam: 'Kent State',
    awayTeam: 'Ball State'
  })
});

test('finds home/away with no records or rankings', () => {
  expect(parseHomeAway('[GAME THREAD] Ball State @ Kent State')).toEqual({
    homeTeam: 'Kent State',
    awayTeam: 'Ball State'
  })
});

test('gets stats from S3 thread', () => {
  expect(parseTeamStats(mockGameJSON.selftext)).toEqual({
    home: {
      passYds: 19,
      rushYds: 328,
      interceptions: 0,
      fumbles: 0,
      fgAttempts: 0,
      fgMakes: 0,
      timeOfPossession: 1114
    },
    away: {
      passYds: 247,
      rushYds: 124,
      interceptions: 1,
      fumbles: 1,
      fgAttempts: 2,
      fgMakes: 2,
      timeOfPossession: 566
    },
  });
});

test('gets scores from S3 thread', () => {
  expect(parseTeamScores(mockGameJSON.selftext)).toEqual({
    home: [2, 22, 14, 7],
    away: [14, 6, 7, 7],
  });
});
