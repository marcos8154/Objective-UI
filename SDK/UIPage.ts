import { PageShell } from "./PageShell";
import { UIView } from "./UIView";
import { NativeLib } from "./NativeLib";
import { DefaultExceptionPage } from "./DefaultExceptionPage";
import { IAppStorageProvider } from "./IAppStorageProvider";

/**
 * A UIPage implementation is the first 
 * Objective-UI class that is instantiated once the page loads.
 * 
 * This class is responsible for initializing the rest of the 
 * Objective-UI library and navigating to the first UIView to be displayed.
 * 
 * Here it is also possible to enable features such as Splitting, Storage, 
 * and also import native JavaScript-CSS libraries
 * 
 * UIPage will initialize a `PageShell` and act in conjunction with it 
 * to manipulate the DOM of the page as a general.
 */
export abstract class UIPage
{
    public static readonly PRODUCT_VERSION: string = '1.0.53'
    public static DISABLE_EXCEPTION_PAGE: boolean = false;
    protected mainShell: PageShell;
    public static shell: PageShell;

    public static DEBUG_MODE: boolean = false;

    public static isAppleMobileDevice(): boolean
    {
        const userAgent = window.navigator.userAgent;
        return /iPad|iPhone|iPod/.test(userAgent)
    }


    constructor(doc: Document)
    {
        this.mainShell = new PageShell(doc, this);
        UIPage.shell = this.mainShell;
        console.info(`* * * Objective-UI v${UIPage.PRODUCT_VERSION} * * *`);
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

    public navigateToView(view: UIView, preventClear: boolean = false): void
    {
        try
        {
            view.initialize(this.mainShell, preventClear);
        }
        catch (error)
        {
            new DefaultExceptionPage(error as Error);
        }
    }
}