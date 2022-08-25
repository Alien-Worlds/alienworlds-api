/**
 * Represents the data structure of the MineLuck mongoDB document
 * @type
 */
export type MineLuckDocument = {
  total_luck: number;
  total_mines: number;
  planets: string[];
  tools: number[];
  avg_luck: number;
  rarities: string[];
  _id: string;
};

/**
 * Represents the data structure of the MineLuck request body
 * @type
 */
export type ListMineLuckRequestDto = {
  query?: {
    from?: string;
    to?: string;
  };
};

/**
 *
 * @type
 */
export type ListMineLuckResultDto = {
  total_luck: number;
  total_mines: number;
  planets: string[];
  tools: number[];
  avg_luck: number;
  rarities: string[];
  miner: string;
};
