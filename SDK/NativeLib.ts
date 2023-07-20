import { Misc } from "./Misc";
import { PageShell } from "./PageShell";

/**
 * Used to do library imports (reference CSS and JavaScript) in a single function. 
 * 
 * A few JavaScript libraries may not work properly 
 * due to the way your code initializes them.
 * At this time, you should resort to 
 * `<script />` import directly into 
 * the .HTML page.
 */
export class NativeLib
{
    libName: string;
    hasCss: boolean;
    hasJs: boolean;

    private cssPath: string;
    private jsPath: string;

    /**
     * Library to be imported.\
     * NOTE!!!: the root-path considered here is `'/lib/'` and this is determined by the static variable `PageShell.LIB_ROOT`
     * @param libName The library folder itself 
     * @param cssPath The name (or subpath) of the library's .css file. If not, ignore this parameter.
     * @param jsPath The name (or subpath) of the library's .js file. If not, ignore this parameter.
     */
    constructor({ libName = '', cssPath = '', jsPath = '' }: {
        libName?: string;
        cssPath?: string;
        jsPath?: string;
    })
    {
        this.libName = libName;
        this.cssPath = cssPath;
        this.jsPath = jsPath;
        this.hasCss = (cssPath != '' && cssPath != null);
        this.hasJs = (jsPath != '' && jsPath != null);
    }

    
    public getCssFullPath(): string
    {
        if(Misc.isNullOrEmpty(this.cssPath)) return '';
        return `${PageShell.LIB_ROOT}${this.libName}/${this.cssPath}`;
    }
    public getJsFullPath(): string
    {
        if (Misc.isNullOrEmpty(this.jsPath)) return '';
        return `${PageShell.LIB_ROOT}${this.libName}/${this.jsPath}`;
    }
    public toString(): string
    {
        return this.libName;
    }
}