import path from 'path'
import fastify, { FastifyInstance } from "fastify";
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import fastifyAutoload from 'fastify-autoload';
import fastifyMongo from 'fastify-mongodb';
import { IncomingMessage, Server, ServerResponse } from "http";

import config from "./config";

export const buildAPI = async (): Promise<FastifyInstance> => {
    const api: FastifyInstance<
        Server,
        IncomingMessage,
        ServerResponse
    > = fastify({
        ignoreTrailingSlash: true,
        trustProxy: true,
        logger: true
    });
    
    api.register(fastifyOas, {
        routePrefix: config.docs.routePrefix,
        exposeRoute: config.docs.exposeRoute,
        swagger: {
            info: {
                title: 'Alien Worlds API',
                description: 'API for Alien Worlds information',
                version: '1.0.0'
            },
            host: config.docs.host,
            schemes: config.schemes,
            consumes: ['application/json'],
            produces: ['application/json']
        }
    });
    
    api.register(fastifyAutoload, {
        dir: path.join(__dirname, 'api-handlers'),
        options: {
            prefix: '/v1/alienworlds'
        }
    });
    
    api.register(fastifyMongo, {
        url: `${config.mongo.host}/${config.mongo.dbName}`
    });
    
    api.register(fastifyCors, {
        allowedHeaders: 'Content-Type',
        origin: '*'
    });

    api.ready().then(async () => {
        console.log(`Started API server on ${config.host}:${config.port}`);
        await api.oas();
    }, (err) => {
        console.error('Error starting API', err)
    });

    return api;
};
