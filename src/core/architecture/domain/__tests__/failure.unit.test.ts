import { Failure } from '../failure';

describe('Failure instance Unit tests', () => {
  it('"fromError" should create instance of the Failure class with the given error', () => {
    const failure = Failure.fromError(new Error('some error'));

    expect(failure.error).toBeInstanceOf(Error);
    expect(failure.error.message).toEqual('some error');
  });

  it('"withMessage" should create instance of the Failure class containing an error with the given message', () => {
    const failure = Failure.withMessage('some message');

    expect(failure.error).toBeInstanceOf(Error);
    expect(failure.error.message).toEqual('some message');
  });

  it('Default "reportable" and "throwable" should be false', () => {
    const failure = Failure.fromError(new Error('some error'));

    expect(failure.throwable).toBeFalsy();
    expect(failure.reportable).toBeFalsy();
  });

  it('"reportable" and "throwable" should be equal to the given values', () => {
    const failure = Failure.fromError(new Error('some error'), true, true);

    expect(failure.throwable).toEqual(true);
    expect(failure.reportable).toEqual(true);

    const failureWithMessage = Failure.withMessage('some message', true, true);

    expect(failureWithMessage.throwable).toEqual(true);
    expect(failureWithMessage.reportable).toEqual(true);
  });
});
