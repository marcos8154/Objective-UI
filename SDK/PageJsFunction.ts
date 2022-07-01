import { FSWidget } from "./FSWidget";

export class PageJsFunction
{
    public functionName: string;
    public functionArgs: string[];
    public functionBodyContent: string;
    private keep: boolean;
    public functionId: string;

    public toString(): string
    {
        return `function ${this.functionName}(${this.argNamesStr()});`;
    }

    constructor({ fnName, fnArgNames = [], fnContent, keepAfterCalled = false }:
        {
            fnName: string,
            fnArgNames?: string[],
            fnContent?: string,
            keepAfterCalled?: boolean,
        })
    {
        this.functionName = fnName;
        this.keep = keepAfterCalled;
        this.functionArgs = fnArgNames;
        this.functionBodyContent = fnContent;
        this.functionId = FSWidget.generateUUID();
    }

    setContent(fnContent: string): PageJsFunction
    {
        this.functionBodyContent = fnContent;
        return this;
    }

    call(...argValues: string[]) : void
    {
        var argNamesStr = this.argNamesStr();
        var argValuesStr = this.argValuesStr(...argValues);

        var fnString = `function ${this.functionName}(${argNamesStr}) {
            ${this.functionBodyContent}
        }
        
        ${this.functionName}(${argValuesStr});`;

        var fn = document.createElement('script');
        fn.id = this.functionId;
        fn.textContent = fnString;

        var els = document.getElementsByTagName('body');
        els[0].append(fn);

        if(this.keep == false)
          fn.remove();
    }

    private argValuesStr(...argValues: string[]) : string
    {
        var argValuesStr = '';
        for (var a = 0; a < argValues.length; a++)
            argValuesStr += `'${argValues[a]}', `;
        if (argValuesStr.endsWith(', '))
            argValuesStr = argValuesStr.substring(0, argValuesStr.length - 2);
        return argValuesStr;
    }

    private argNamesStr(): string
    {
        var argNamesStr = '';
        for (var a = 0; a < this.functionArgs.length; a++)
            argNamesStr += `${this.functionArgs[a]}, `;
        if (argNamesStr.endsWith(', '))
            argNamesStr = argNamesStr.substring(0, argNamesStr.length - 2);
        return argNamesStr;
    }
}