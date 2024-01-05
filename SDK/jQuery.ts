import { VirtualFunction } from "./VirtualFunction";

/**
 * An wrapper of jQuery lib ported for Objective-UI
 */
export class jQuery
{
    private static callback: Function = null;

    /**
     * 
     * @param idOrClass 
     * @param fn 
     * ``` 
     *  function($:any) { 
        // $ is jQuery instance
      } 
     * ```
     */
    public static $(idOrClass: string, fn: Function)
    {
        jQuery.callback = fn;
        new VirtualFunction({
            fnName: 'wrapQuery',
            fnArgNames: ['idOrClass'],
            fnContent: `
                jQuery.callback($(idOrClass));
                jQuery.callback = null;
            `    ,
            keepAfterCalled: true
        },).call(idOrClass);
    }
}