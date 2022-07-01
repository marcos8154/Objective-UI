import { APIResponse, WebAPI } from "./WebAPI";

export class SimulatedAPIRoute
{
    private method: string;
    private resource: string;
    private endPoint: Function;

    constructor(resource: string, method: string, endPoint: Function)
    {
        this.method = method;
        this.resource = resource;
        this.endPoint = endPoint;
    }

    public getMethod()
    {
        return this.method;
    }

    public getResource()
    {
        return this.resource;
    }

    public simulateRoute({ body = null, params = null }:
        {
            body?: any | object,
            params?: Array<string>
        }): any
    {
        if (this.method == 'GET' || this.method == 'DELETE')
        {
            return this.endPoint(params);
        }
        else
            return this.endPoint(body);
    }

    public toString()
    {
        return `[${this.method}] ${this.resource}`;
    }
}

export abstract class WebAPISimulator
{
    private simulatedRoutes: Array<SimulatedAPIRoute> = [];

    /**
     * @param httpMethod **for GET/DELETE routes** - functionEndpoint(**params: Array**): any|object   
     *                   **for POST/PUT routes**   - functionEndpoint(**body: any|object**): any|object
     * @param resource 
     * @param endPoint functionEndpoint(params: Array): any|object;
     */
    protected mapRoute(httpMethod: string, resource: string, endPoint: Function): WebAPISimulator
    {
        this.simulatedRoutes.push(new SimulatedAPIRoute(resource, httpMethod, endPoint));
        return this;
    }

    public simulateRequest(
        httpMethod: string,
        resource: string,
        body: any | object): any | object
    {
        for (var i = 0; i < this.simulatedRoutes.length; i++)
        {
            const route: SimulatedAPIRoute = this.simulatedRoutes[i];
            const isResource = resource.startsWith(route.getResource());
            const isMethod = httpMethod == route.getMethod();

            if (isResource && isMethod)
            {
                if (route.getMethod() == 'GET' || route.getMethod() == 'DELETE')
                {
                    const path = resource.replace(route.getResource(), '');
                    var params = path.split('/');
                    if (params.length > 0)
                        if (params[0] == '') params = params.splice(-1, 1);
                    return new APIResponse({
                        code: 200,
                        msg: 'fetched from API Simulator',
                        content: route.simulateRoute({ params })
                    });
                }

                if (route.getMethod() == 'POST' || route.getMethod() == 'PUT')
                    return new APIResponse({
                        code: 200,
                        msg: 'ferched from API Simulator',
                        content: route.simulateRoute({ body: JSON.parse(body) })
                    })
                break;
            }
        }
    }
}