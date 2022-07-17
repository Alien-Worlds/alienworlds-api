import { Route } from '@core/api/route';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

type Api = FastifyInstance<Server, IncomingMessage, ServerResponse>;

export class FastifyRoute {
  constructor(private readonly app: Api, route: Route) {
    this.mount(route);
  }

  public mount(route: Route): Api {
    const routeHandler = async (req: FastifyRequest, res: FastifyReply) => {
      let args: unknown;
      if (route.options?.hooks?.pre) {
        args = route.options?.hooks?.pre(req);
      }
      try {
        const result = await route.handler(args);
        if (route.options?.hooks?.post) {
          const { status, body } = route.options?.hooks?.post(result);
          res.status(status).send(body);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        // TODO: map errors to codes etc.
        // create appropriate message
        res.status(500).send(error);
      }
    };

    switch (route.method) {
      case 'POST': {
        this.app.post(<string>route.path, routeHandler);
        break;
      }
      case 'GET': {
        this.app.get(<string>route.path, routeHandler);
        break;
      }
      case 'PUT': {
        this.app.put(<string>route.path, routeHandler);
        break;
      }
      case 'DELETE': {
        this.app.delete(<string>route.path, routeHandler);
        break;
      }
      default: {
        // TODO: fix it
        throw new Error('Method not defined');
      }
    }

    return this.app;
  }
}
