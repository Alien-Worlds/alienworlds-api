import { Route } from '@alien-worlds/api-core';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

type Api = FastifyInstance<Server, IncomingMessage, ServerResponse>;

export class FastifyRoute {
  public static mount(app: Api, route: Route): Api {
    /**
     *
     * @param {FastifyRequest} req
     * @param {FastifyReply} res
     */
    const routeHandler = async (req: FastifyRequest, res: FastifyReply) => {
      const { hooks, validators } = route.options || {};

      if (validators?.request) {
        const { valid, message, code } = validators.request(req);

        if (!valid) {
          return res.status(code || 400).send(message);
        }
      }

      try {
        let args: unknown;

        if (hooks.pre) {
          args = hooks.pre(req);
        }

        const result = await route.handler(args);

        if (hooks.post) {
          const { status, body } = hooks.post(result);
          res.status(status).send(body);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        res.status(500).send(error);
      }
    };

    switch (route.method) {
      case 'POST': {
        app.post(<string>route.path, routeHandler);
        break;
      }
      case 'GET': {
        app.get(<string>route.path, routeHandler);
        break;
      }
      case 'PUT': {
        app.put(<string>route.path, routeHandler);
        break;
      }
      case 'DELETE': {
        app.delete(<string>route.path, routeHandler);
        break;
      }
      default: {
        // TODO: fix it
        throw new Error('Method not defined');
      }
    }

    return app;
  }
}
