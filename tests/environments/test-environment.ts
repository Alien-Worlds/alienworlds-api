export type HookCallback = (...args: unknown[]) => void;

export type TestHooks = {
  beforeAll?: HookCallback;
  beforeEach?: HookCallback;
  afterAll?: HookCallback;
  afterEach?: HookCallback;
};

export interface TestEnvironment {
  initialize(hooks?: TestHooks): void;
}
