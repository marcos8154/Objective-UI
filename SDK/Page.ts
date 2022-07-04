import { PageShell } from "./PageShell";
import { View } from "./UIView";
import { NativeLib } from "./NativeLib";
import { DefaultExceptionPage } from "./DefaultExceptionPage";
import { IAppStorageProvider } from "./IAppStorageProvider";

export abstract class Page
{
    public static DISABLE_EXCEPTION_PAGE: boolean = false;
    protected mainShell: PageShell;

    constructor(doc: Document)
    {
        this.mainShell = new PageShell(doc, this);
    }

    protected setStorageProvider(provider: IAppStorageProvider): void
    {
        this.mainShell.setStorageProvider(provider);
    }

    protected enableSplitting(appContainerId: string, splitContainerId: string): void
    {
        this.mainShell.enableSplitting(appContainerId, splitContainerId);
    }

    protected setLibRoot(rootPath: string): void
    {
        PageShell.LIB_ROOT = rootPath;
    }

    protected importLib({ libName, cssPath, jsPath }: { libName: string; cssPath?: string; jsPath?: string; })
    {
        this.mainShell.import(new NativeLib({ libName, cssPath, jsPath }));
    }

    public navigateToView(view: View): void
    {
        try
        {
            view.initialize(this.mainShell);
        }
        catch(error)
        {
            new DefaultExceptionPage(error as Error);
        }
    }
}