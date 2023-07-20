"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.WebAPI = //exports.APIResponse = //exports.Bearer = void 0;
class Bearer {
    static get(token) {
        return new Headers({
            'content-type': 'application/json',
            'authorization': `Bearer ${token}`
        });
    }
}
//exports.Bearer = Bearer;
class APIResponse {
    constructor({ code, msg, content }) {
        this.statusCode = code;
        this.statusMessage = msg;
        this.content = content;
    }
}
//exports.APIResponse = APIResponse;
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
class WebAPI {
    constructor(url, method) {
        this.request = {};
        this.request.method = method;
        this.apiUrl = url;
        this.withHeaders(new Headers({ 'content-type': 'application/json' }));
    }
    static setURLBase(apiUrlBase) {
        WebAPI.urlBase = apiUrlBase;
    }
    static requestTo(requestString, httpMethod) {
        if (requestString.startsWith('http'))
            return new WebAPI(requestString, httpMethod);
        else {
            if (this.urlBase == '' || this.urlBase == undefined)
                return new WebAPI(`${requestString}`, httpMethod);
            else
                return new WebAPI(`${WebAPI.urlBase}${requestString}`, httpMethod);
        }
    }
    static useSimulator(simulator) {
        WebAPI.simulator = simulator;
    }
    static GET(requestString) {
        return this.requestTo(requestString, 'GET');
    }
    static POST(requestString) {
        return this.requestTo(requestString, 'POST');
    }
    static PUT(requestString) {
        return this.requestTo(requestString, 'PUT');
    }
    static DELETE(requestString) {
        return this.requestTo(requestString, 'DELETE');
    }
    call() {
        if (WebAPI.simulator == null) {
            var statusCode;
            var statusMsg;
            var self = this;
            fetch(self.apiUrl, self.request)
                .then(function (ret) {
                statusCode = ret.status;
                statusMsg = ret.statusText;
                return ret.text();
            })
                .then(function (text) {
                var json = null;
                if (text.startsWith("{") || text.startsWith("["))
                    json = JSON.parse(text);
                var apiResponse = new APIResponse({
                    code: statusCode, msg: statusMsg, content: json
                });
                return apiResponse;
            })
                .then(function (res) {
                const code = res.statusCode;
                if (code == 200 || code == 201 || code == 202) {
                    if (self.fnOnSuccess != null)
                        self.fnOnSuccess(res);
                    if (self.fnDataResultTo != null) {
                        var data = res.content;
                        self.fnDataResultTo(data);
                    }
                }
                else {
                    if (self.fnOnError != null)
                        self.fnOnError(new Error(`${code} - ${res.statusMessage}`));
                }
            })
                .catch(err => (self.fnOnError == null ? {} : self.fnOnError(err)));
        }
        else {
            try {
                var result = WebAPI.simulator.simulateRequest(this.request.method, this.apiUrl.replace(WebAPI.urlBase, ''), this.request.body);
                if (Misc.isNull(this.fnOnSuccess) == false)
                    this.fnOnSuccess(result);
                if (Misc.isNullOrEmpty(this.fnDataResultTo) == false) {
                    var data = result.content;
                    this.fnDataResultTo(data);
                }
            }
            catch (error) {
                this.fnOnError(error);
            }
        }
    }
    dataResultTo(callBack) {
        this.fnDataResultTo = callBack;
        return this;
    }
    onSuccess(callBack) {
        this.fnOnSuccess = callBack;
        return this;
    }
    onError(callBack) {
        this.fnOnError = callBack;
        return this;
    }
    withAllOptions(requestInit) {
        this.request = requestInit;
        return this;
    }
    withBody(requestBody) {
        this.request.body = JSON.stringify(requestBody);
        return this;
    }
    withHeaders(headers) {
        this.request.headers = headers;
        return this;
    }
}
//exports.WebAPI = WebAPI;
