import { providers } from 'ethers';

export const getJsonRpcProvider = async (
  url: string
): Promise<providers.JsonRpcProvider> =>
  new Promise((resolve, reject) => {
    try {
      const provider = new providers.JsonRpcProvider(url);
      // TO DO: find a way to check if it is connected
      // provider.addListener('network', () => {
      //   return resolve(provider);
      // });
      resolve(provider);
    } catch (error) {
      reject(error);
    }
  });
