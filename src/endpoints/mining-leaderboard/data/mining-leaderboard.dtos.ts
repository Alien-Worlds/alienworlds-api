/**
 * @type
 */
export type ListLeaderboardRequestDto = {
  sort?: string;
  filter?: string;
  from?: string;
  to?: string;
  items_per_page?: number;
  page?: number;
};

/**
 * @type
 */
export type MiningLeaderboardResultDto = {
  position: number;
  username: string;
  tlm_gains_total: number;
  tlm_gains_highest: number;
  daily_total_nft_points: number;
  avg_charge_time: number;
  avg_mining_power: number;
  avg_nft_power: number;
  lands_mined_on: number;
  planets_mined_on: number;
  mine_rating: number;
};
