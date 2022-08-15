import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { GetNftsInput } from '../domain/models/get-nfts.input';
import { GetNftsOutput } from '../domain/models/get-nfts.output';
import { NftsNotFoundError } from '@common/nfts/domain/errors/nfts-not-found.error';
import { NftsRequestDto } from '../data/nfts.dtos';

/**
 *
 * @param {Result<NFT[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<GetNftsOutput>) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;
    if (error instanceof NftsNotFoundError) {
      return {
        status: 200,
        body: GetNftsOutput.create().toJson(),
      };
    }

    return {
      status: 500,
      body: 'Server error',
    };
  }

  const { content } = result;

  return {
    status: 200,
    body: content.toJson(),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (
  request: Request<NftsRequestDto>
) => {
  // parse DTO (query) to the options required by the controller method
  return GetNftsInput.fromDto(request.query || {});
};

/**
 * @class
 */
export class GetNftsRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetNftsRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/nfts', handler, {
      hooks: {
        pre: parseRequestOptionsToHandlerInput,
        post: parseHandlerResultToResponse,
      },
      validators: {
        request: (request: Request<NftsRequestDto>) => {
          const errors = [];

          if (request.query.sort) {
            const sort = request.query.sort.toLowerCase();

            if (sort !== 'asc' && sort !== 'desc') {
              errors.push(`sort: should be "asc" or "desc"`);
            }
          }

          if (request.query.limit > 1000) {
            errors.push(`limit: should be lower than 1000`);
          }

          return { valid: errors.length === 0, message: errors.join(', ') };
        },
      },
    });
  }
}
