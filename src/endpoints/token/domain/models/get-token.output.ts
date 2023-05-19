import { Result } from '@alien-worlds/api-core';

/**
 * @class
 */
export class GetTokenOutput {
  /**
   *
   * @param {TokenRequestDto} dto
   * @returns {GetTokenInput}
   */
  public static create(result: Result<string>): GetTokenOutput {
    return new GetTokenOutput(result);
  }

  private constructor(public readonly result: Result<string>) {}

  public toResponse() {
    const { result } = this;
    if (result.isFailure) {
      // handle failure
      const { error } = result.failure;
      return {
        status: 500,
        body: error.message,
      };
    }
    const { content } = result;

    const supply = parseFloat(content.replace(' TLM', '')).toFixed(4);

    return {
      status: 200,
      body: supply,
    };
  }
}
