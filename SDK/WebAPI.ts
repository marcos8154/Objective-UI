import { WebAPISimulator } from "./WebAPISimulator";

export class APIResponse
{
    public statusCode: number;
    public statusMessage: string;
    public content: any | object;

    constructor({ code, msg, content }:
        {
            code: number,
            msg: string,
            content: any | object,
        })
    {
        this.statusCode = code;
        this.statusMessage = msg;
        this.content = content;
    }
}

/**
 * Offers an abstraction for consuming REST APIs with the 
 * possibility of simulating a local 
 * API for development purposes;
 * 
 * If your FrontEnd is not running alongside the API, 
 * be careful to call previously (once) 
 * ```
 * WebAPI.setURLBase('https://complete-url-of-api.com')
 * ``` 
 * 
 * Example: 
 * ```
WebAPI
.POST('/api/route/xyz') //.GET() / .PUT() / .DELETE()
.withBody(objectBodyHere) //if .POST() or .PUT()
.onSuccess(function (res: APIResponse){ 
    //success handle function
})
.onError(function(err: Error){
    //request-error handle function
})
.call(); //call REST api
 * ```
 */
export class WebAPI
{
    private static urlBase: string;
    public static setURLBase(apiUrlBase: string)
    {
        WebAPI.urlBase = apiUrlBase;
    }

    public static requestTo(requestString: string, httpMethod: string)
    {
        if (requestString.startsWith('http'))
            return new WebAPI(requestString, httpMethod);
        else
        {
            if (this.urlBase == '' || this.urlBase == undefined)
                return new WebAPI(`${requestString}`, httpMethod);
            else
                return new WebAPI(`${WebAPI.urlBase}${requestString}`, httpMethod);
        }
    }

    public static useSimulator(simulator: WebAPISimulator): void
    {
        WebAPI.simulator = simulator;
    }

    public static GET(requestString: string)
    {
        return this.requestTo(requestString, 'GET');
    }

    public static POST(requestString: string)
    {

        return this.requestTo(requestString, 'POST');
    }

    public static PUT(requestString: string)
    {
        return this.requestTo(requestString, 'PUT');
    }

    public static DELETE(requestString: string)
    {
        return this.requestTo(requestString, 'DELETE');
    }

    private request: RequestInit;
    private apiUrl: string;
    private fnOnSuccess: Function;
    private fnOnError: Function;
    private static simulator: WebAPISimulator;

    private constructor(url: string, method: string)
    {
        this.request = {};
        this.request.method = method;
        this.apiUrl = url;
        this.withHeaders(new Headers({ 'content-type': 'application/json' }));
    }

    public call(): void
    {
        if (WebAPI.simulator == null)
        {
            var statusCode: number;
            var statusMsg: string;

            fetch(this.apiUrl, this.request)
                .then(function (ret)
                {
                    statusCode = ret.status;
                    statusMsg = ret.statusText;
                    return ret.text();
                })
                .then(function (text)
                {
                    var json = null;
                    if (text.startsWith("{")) json = JSON.parse(text);
                    var apiResponse = new APIResponse({
                        code: statusCode, msg: statusMsg, content: json
                    });
                    return apiResponse;
                })
                .then(response => (this.fnOnSuccess == null ? {} : this.fnOnSuccess(response)))
                .catch(err => (this.fnOnError == null ? {} : this.fnOnError(err)));
        }
        else
        {
            try
            {
                var result = WebAPI.simulator.simulateRequest(
                    this.request.method,
                    this.apiUrl.replace(WebAPI.urlBase, ''),
                    this.request.body);

                this.fnOnSuccess(result);
            } catch (error)
            {
                this.fnOnError(error);
            }
        }
    }

    public onSuccess(callBack: Function): WebAPI
    {
        this.fnOnSuccess = callBack;
        return this;
    }

    public onError(callBack: Function): WebAPI
    {
        this.fnOnError = callBack;
        return this;
    }

    public withAllOptions(requestInit: RequestInit): WebAPI
    {
        this.request = requestInit;
        return this;
    }

    public withBody(requestBody: any | object): WebAPI
    {
        this.request.body = JSON.stringify(requestBody);
        return this;
    }

    public withHeaders(headers: Headers): WebAPI
    {
        this.request.headers = headers;
        return this;
    }
}