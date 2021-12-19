#!/usr/bin/env node

import NodeEnvironment from "jest-environment-node";
import { FastifyInstance } from "fastify";
import { buildAPI } from "../src/api";

export default class FastifyEnvironment extends NodeEnvironment {

  public async setup(): Promise<void> {
    await super.setup();
    const fastify = await buildAPI();
    this.global.fastify = fastify;
  }

  public async teardown(): Promise<void> {
    (<FastifyInstance>this.global.fastify).close();
    await super.teardown();
  }
}