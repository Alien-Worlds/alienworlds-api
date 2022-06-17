import { Failure } from '../failure';
import { Result } from '../result';

describe('Result instance Unit tests', () => {
  it('"withContent" should create instance of the Reult class with the given content', () => {
    const result = Result.withContent<number>(100);

    expect(result.failure).toBeUndefined();
    expect(result.content).toEqual(100);
  });

  it('"withoutContent" should create instance of the Reult class with null content', () => {
    const result = Result.withoutContent();

    expect(result.content).toBeUndefined();
    expect(result.failure).toBeUndefined();
  });

  it('"withFailure" should create instance of the Reult class containing the failure and undefined content', () => {
    const result = Result.withFailure(Failure.withMessage('failure'));

    expect(result.failure).toBeInstanceOf(Failure);
    expect(result.content).toBeUndefined();
  });
});
