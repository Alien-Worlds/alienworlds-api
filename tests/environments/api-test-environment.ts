import { TestEnvironment, TestHooks } from "./test-environment";

export interface TestEnvironmentServer {
    inject<T>(options: {
        url: string,
        method: string,
        payload?: T,
    })
}

export interface ApiTestEnvironment extends TestEnvironment {
    get server(): TestEnvironmentServer;
    initialize(hooks?: TestHooks): void;
}
