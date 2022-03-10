import { buildCommand, commanderParseInt } from '../filler.utils';
describe('Filler utils Unit tests', () => {
  it('"buildCommand" should build commander program with default options', async () => {
    const command = buildCommand([]);
    expect(command.opts()).toEqual({
      continueWithFiller: false,
      endBlock: 4294967295,
      replay: false,
      startBlock: -1,
      test: 0,
    });
  });

  it('"commanderParseInt" should parse the string to an integer', async () => {
    expect(commanderParseInt('15e2')).toEqual(15);
  });

  it('"commanderParseInt" should throw an error if given value is NaN', async () => {
    try {
      commanderParseInt('test');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
