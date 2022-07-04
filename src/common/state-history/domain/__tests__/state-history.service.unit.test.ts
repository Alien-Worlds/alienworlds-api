import 'reflect-metadata';

import { StateHistoryService } from '../state-history.service';

describe('State History Service Unit tests', () => {
  it('"Token" should be set', () => {
    expect(StateHistoryService.Token).not.toBeNull();
  });
});
