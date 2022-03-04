import fetch from 'node-fetch';
import { RequestError } from '../core/errors/request.error';
import { Failure } from '../core/domain/failure';
import { Result } from '../core/domain/result';
import { ActionDto, GetActionsResponseDto } from './fetch-abis.types';

/**
 * Fetch actions by account from https://api.waxsweden.org
 *
 * @async
 * @param {string} directory
 * @returns {Promise<Result<ActionDto[]>>}
 */
export const getActionsByAccount = async (
  account: string
): Promise<Result<ActionDto[]>> => {
  try {
    const url = `https://api.waxsweden.org/v2/history/get_actions?account=${account}&filter=eosio:setabi&limit=100&sort=1`;
    const response = await fetch(url);
    const json = await response.json();

    if (response.ok) {
      const { actions }: GetActionsResponseDto = json;
      return Array.isArray(actions)
        ? Result.withContent(actions)
        : Result.withFailure(Failure.withMessage(JSON.stringify(json)));
    }
    const { status, statusText } = response;
    return Result.withFailure(
      Failure.fromError(new RequestError(status, statusText, json))
    );
  } catch (error) {
    return Result.withFailure(Failure.fromError(<Error>error));
  }
};
