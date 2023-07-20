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
        const parIndx: number = this.resource.indexOf('{');
        if (parIndx > 0)
        {
            var pureRes = this.resource.substring(0,parIndx)
            return pureRes;
        }

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

/**
 * Allows you to simulate a REST API locally based on an 
 * API that may not yet exist, but will respond for the routes
 * that are defined in the Simulator.
 * 
 * You must inherit this class and define it in
    ```
    WebAPI.useSimulator(new MyAPISimulatorImpl());
    ```
 */
export abstract class WebAPISimulator
{
    private simulatedRoutes: Array<SimulatedAPIRoute> = [];

    /**
     * Maps a simulated route to which this 
     * Simulator should respond when 
     * ```
     *WebAPI.call()
     * ``` 
     * is invoked
     * 
     * @param httpMethod 'GET' / 'POST' / 'PUT' / 'DELETE'
     * @param resource The resource name or endpoint path that the real API would have
     * @param endPoint A function (callback) that should respond for the resource endpoint 
     *
     * Function definition should follow these standards:
     * 
     * **for GET/DELETE routes** - 
     *  ```
     * functionEndpointName(params: Array<string>): any|object
     * ```
     *                   
     * **for POST/PUT routes** 
     * ```
     * functionEndpointName(body: any|object): any|object
     * ```
     */
    protected mapRoute(httpMethod: string, resource: string, endPoint: Function): WebAPISimulator
    {
        this.simulatedRoutes.push(new SimulatedAPIRoute(resource, httpMethod, endPoint));
        return this;
    }

    /**
     * Fires a request originating from the `WebAPI` 
     * class and redirected to the Simulator,
     * which will respond by calling 
     * a "fake-endpoint" function
     */
    public simulateRequest(
        httpMethod: string,
        resource: string,
        body: any | object): APIResponse
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
                        if (params[0] == '')
                            params.shift();

                    return new APIResponse({
                        code: 200,
                        msg: 'fetched from API Simulator',
                        content: route.simulateRoute({ params })
                    });
                }

                if (route.getMethod() == 'POST' || route.getMethod() == 'PUT')
                {
                    return new APIResponse({
                        code: 200,
                        msg: 'fetched from API Simulator',
                        content: route.simulateRoute({ body: JSON.parse(body) })
                    })
                }
                break;
            }
        }

        return new APIResponse({
            code: 404,
            msg: `[API SIMULATOR] Resource '${resource}' not found; Check if route is correctly typed; Ensure your simulated api functions is maped on constructor;`,
            content: null
        });
    }
}