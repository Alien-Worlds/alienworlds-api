/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionDto } from '@common/actions/data/actions.dtos';
import { Action } from '../action';

const actionDto: ActionDto = {
  type: 'FOO_TYPE',
  name: 'foo.name',
  ricardian_contract: 'contract',
};

describe('Act Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = Action.fromDto(actionDto);
    expect(entity.toDto()).toEqual(actionDto);
  });
});
