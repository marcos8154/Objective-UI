import { PageShell } from "./PageShell";

export class NativeLib
{
    libName: string;
    hasCss: boolean;
    hasJs: boolean;

    private cssPath: string;
    private jsPath: string;

    constructor({ libName, cssPath = '', jsPath = '' }: 
            { 
                libName: string; 
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

    getCssFullPath(): string
    {
        return `${PageShell.LIB_ROOT}${this.libName}/${this.cssPath}`;
    }

    getJsFullPath(): string
    {
        return `${PageShell.LIB_ROOT}${this.libName}/${this.jsPath}`;
    }

    public toString(): string
    {
        return this.libName;
    }
}