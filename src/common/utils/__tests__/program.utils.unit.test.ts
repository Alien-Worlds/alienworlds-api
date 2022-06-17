import { programParseInt } from '../program.utils';
describe('Filler utils Unit tests', () => {
  it('"programParseInt" should parse the string to an integer', async () => {
    expect(programParseInt('15e2')).toEqual(15);
  });

  it('"programParseInt" should throw an error if given value is NaN', async () => {
    try {
      programParseInt('test');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
