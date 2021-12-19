export interface TestEnvironmentServer {
    inject<T>(options: {
        url: string,
        method: string,
        payload?: T,
    })
}

export type TestHooks = {
    beforeAll?: Function,
    beforeEach?: Function,
    afterAll?: Function,
    afterEach?: Function,
}

export interface TestEnvironment {
    get server(): TestEnvironmentServer;
    initialize(hooks?: TestHooks): void;
}
