export type TestHooks = {
    beforeAll?: Function,
    beforeEach?: Function,
    afterAll?: Function,
    afterEach?: Function,
}

export interface TestEnvironment {
    initialize(hooks?: TestHooks): void;
}
