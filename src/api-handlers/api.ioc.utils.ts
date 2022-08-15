import { providers } from 'ethers';

export const getJsonRpcProvider = async (
  url: string
): Promise<providers.JsonRpcProvider> =>
  new Promise((resolve, reject) => {
    try {
      const provider = new providers.JsonRpcProvider(url);
      provider.addListener('network', () => {
        return resolve(provider);
      });
    } catch (error) {
      return reject(error);
    }
  });
