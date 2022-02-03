import { MineLuck, MineLuckResult } from '../../mineluck';

export const blankMineluck: MineLuck = {
  totalLuck: 0,
  totalMines: 0,
  planets: [],
  tools: [],
  avgLuck: 0,
  rarities: [],
  miner: '',
};

export const magorWorldCompleteMineluck: MineLuck = {
  totalLuck: 6,
  totalMines: 1,
  planets: ['magor.world'],
  tools: [1099610688701, 1099609303091, 1099607507334],
  avgLuck: 6,
  rarities: ['Abundant', 'Abundant', 'Abundant'],
  miner: '2p3kw.c.wam',
};

export const magorWorldWithoutRaritiesMineluck: MineLuck = {
  totalLuck: 6,
  totalMines: 1,
  planets: ['magor.world'],
  tools: [1099610688701, 1099609303091, 1099607507334],
  avgLuck: 6,
  rarities: [],
  miner: 'ih2kw.c.wam',
};

export const magorWorldWithoutRaritiesMineluckResult: MineLuckResult = {
  total_luck: 6,
  total_mines: 1,
  planets: ['magor.world'],
  tools: [1099610688701, 1099609303091, 1099607507334],
  avg_luck: 6,
  rarities: [],
  miner: 'ih2kw.c.wam',
};

export const magorWorldCompleteMineluckResult: MineLuckResult = {
  total_luck: 6,
  total_mines: 1,
  planets: ['magor.world'],
  tools: [1099610688701, 1099609303091, 1099607507334],
  avg_luck: 6,
  rarities: ['Abundant', 'Abundant', 'Abundant'],
  miner: '2p3kw.c.wam',
};
