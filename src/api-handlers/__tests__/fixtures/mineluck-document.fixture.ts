import { MineLuckDocument } from '../../mineluck';

export const blankMineluckDocument: MineLuckDocument = {
  total_luck: 0,
  total_mines: 0,
  planets: [],
  tools: [],
  avg_luck: 0,
  rarities: [],
  _id: '',
};

export const magorWorldCompleteMineluckDocument: MineLuckDocument = {
  total_luck: 6,
  total_mines: 1,
  planets: ['magor.world'],
  tools: [1099610688701, 1099609303091, 1099607507334],
  avg_luck: 6,
  rarities: ['Abundant', 'Abundant', 'Abundant'],
  _id: '2p3kw.c.wam',
};
