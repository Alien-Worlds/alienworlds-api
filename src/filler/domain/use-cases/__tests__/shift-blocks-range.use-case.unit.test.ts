import 'reflect-metadata';
import { Container } from 'inversify';
import { ShiftBlocksRangeUseCase } from '../shift-blocks-range.use-case';
import { BlocksRange } from '@common/block/domain/entities/blocks-range';

let container: Container;
let useCase: ShiftBlocksRangeUseCase;

describe('ShiftBlocksRangeUseCase Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<ShiftBlocksRangeUseCase>(ShiftBlocksRangeUseCase.Token)
      .to(ShiftBlocksRangeUseCase);
  });

  beforeEach(() => {
    useCase = container.get<ShiftBlocksRangeUseCase>(
      ShiftBlocksRangeUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ShiftBlocksRangeUseCase.Token).not.toBeNull();
  });

  it('Should return a BlocksRange within the given start value and 0xffffffff', async () => {
    const result = await useCase.execute(BlocksRange.create(0, 100));
    expect(result.content).toEqual(BlocksRange.create(100, 0xffffffff));
    expect(result.failure).toBeUndefined();
  });
});
