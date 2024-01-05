import { Misc } from "./Misc";
import { Widget } from "./Widget";

/**
 * Represents a native JavaScript function virtually controlled by TypeScript
 * 
 * Through this class, a JavaScript function will be 
 * dynamically placed in the DOM of the page, 
 * executed and then destroyed. 
 * 
 * From this, it is possible to invoke functions from 
 * native JavaScript libraries from the written TypeScrit 
 * code.
 */
export class VirtualFunction
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

    /**
     * Defines a JavaScript virtual function
     * @param fnName the function name
     * @param fnArgNames An array with the names of the function's arguments (the variables that the function takes)
     * @param fnContent The literal body of the function; NOTE: you must not specify `{ or } ` here. Only the raw body of the function is allowed
     * @param keepAfterCalled Determines whether the function should remain active on the page after the first call. By default it is false.
     */
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
        this.functionId = Misc.generateUUID();
    }

    /**
     * @param fnContent The literal body of the function; NOTE: you must not specify `{ or } ` here. Only the raw body of the function is allowed
     */
    setContent(fnContent: string): VirtualFunction
    {
        this.functionBodyContent = fnContent;
        return this;
    }

    /**
     * Calls the JavaScript function. 
     * Here the function will materialize in the 
     * DOM as a `<script> function here </script>` tag and the 
     * function will be inside it
     * @param argValues An array with the VALUES of the arguments defined in the function. Note that you must pass the array according to the actual parameters of the function.
     */
    call(...argValues: string[]): VirtualFunction
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

        if (this.keep == false)
            fn.remove();

        return this;
    }

    private argValuesStr(...argValues: string[]): string
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