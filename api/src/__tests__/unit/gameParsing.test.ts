import { parseHomeAway } from '../../tasks/parseGameThread';
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
