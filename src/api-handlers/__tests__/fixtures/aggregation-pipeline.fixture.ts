const pipelineBase = [
  {
    $group: {
      _id: '$miner',
      total_luck: { $sum: '$params.luck' },
      total_mines: { $sum: 1 },
      planets: { $addToSet: '$planet_name' },
      bag_items: { $addToSet: '$bag_items' },
    },
  },
  { $match: { total_luck: { $gt: 0 } } },
  {
    $addFields: {
      tools: { $arrayElemAt: ['$bag_items', 0] },
      avg_luck: { $divide: ['$total_luck', '$total_mines'] },
    },
  },
  {
    $lookup: {
      from: 'assets',
      localField: 'tools',
      foreignField: 'asset_id',
      as: 'rarities',
    },
  },
  {
    $project: {
      _id: 1,
      total_luck: 1,
      avg_luck: 1,
      total_mines: 1,
      planets: 1,
      tools: 1,
      rarities: {
        $map: {
          input: '$rarities',
          as: 'asset',
          in: '$$asset.data.immutable_serialized_data.rarity',
        },
      },
    },
  },
];

export const pipelineWithoutBlockTimestamps = [{ $match: {} }, ...pipelineBase];

export const pipelineWithBlockTimestamps = (from: Date, to: Date) => [
  { $match: { block_timestamp: { $gte: from, $lt: to } } },
  ...pipelineBase,
];

export const pipelineWithEndBlockTimestamp = (to: Date) => [
  { $match: { block_timestamp: { $lt: to } } },
  ...pipelineBase,
];
