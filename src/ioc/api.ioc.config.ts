import { Container } from '@alien-worlds/api-core';
import { ApiTestsMongoHelper, getJsonRpcProvider } from './api.ioc.utils';
import {
  MongoSource,
  connectMongoClient,
  getDatabase,
} from '@alien-worlds/api-core';
import AppConfig from '../config/app-config';
import { bindAssetsEndpointComponents } from '../endpoints/asset/ioc.config';
import { bindMineLuckEndpointComponents } from '../endpoints/mine-luck/ioc.config';
import { bindMinesEndpointComponents } from '../endpoints/mines/ioc.config';
import { bindNftsEndpointComponents } from '../endpoints/nfts/ioc.config';
import { bindTokenEndpointComponents } from '../endpoints/token/ioc.config';
import { bindMiningLeaderboardEndpointComponents } from '../endpoints/mining-leaderboard/ioc.config';

export const setupEndpointDependencies = async (
  container: Container,
  config: AppConfig
): Promise<Container> => {
  const {
    bscTokenContract,
    bscEndpoint,
    ethTokenContract,
    ethEndpoint,
    mongo: { url, dbName },
  } = config;
  const mongoClient = await connectMongoClient(url);
  const database = getDatabase(mongoClient, dbName);
  const mongoSource = new MongoSource(database);
  /**
   * endpoints
   */
  /* /assets */
  bindAssetsEndpointComponents(container, mongoSource);

  /* /mineluck */
  bindMineLuckEndpointComponents(container, mongoSource);

  /* /mines */
  bindMinesEndpointComponents(container, mongoSource);

  /* /nfts */
  bindNftsEndpointComponents(container, mongoSource);

  /* /mining-leaderboard */
  bindMiningLeaderboardEndpointComponents(container, mongoSource);

  /* /token */

  const ethProvider = await getJsonRpcProvider(ethEndpoint);
  const bscProvider = await getJsonRpcProvider(bscEndpoint);

  bindTokenEndpointComponents(
    container,
    ethProvider,
    bscProvider,
    ethTokenContract,
    bscTokenContract
  );

  /**
   * api tests helpers
   */
  container
    .bind<ApiTestsMongoHelper>(ApiTestsMongoHelper.Token)
    .toConstantValue(mongoClient);

  return container;
};
