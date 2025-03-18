import { AppStorage } from "./AppStorage";
import { UIPage } from "./UIPage";
import { UIView } from "./UIView";
import { IAppStorageProvider } from "./IAppStorageProvider";
import { NativeLib as NativeLib } from "./NativeLib";
import { Misc } from "./Misc";
import { UIFlatView } from "./UIFlatView";
import { YordView } from "./yord-api/YordView";
import { YordViewContext } from "./yord-api/YordViewContext";
import { VirtualFunction } from "./VirtualFunction";


/**
 * PageShell is a class that works at the lowest level (next to the page)
 * and performs some tasks in the DOM interface such as 
 * creating/finding/removing elements, 
 * directly importing native JS-CSS libraries 
 * and controlling access to resources such as SplitView, Storage and others.
 */
export class PageShell
{
    loadBSVersion()
    {
        if (PageShell.BOOTSTRAP_VERSION_NUMBER > 0) return;
        new VirtualFunction({
            fnName: 'getBSVersion',
            fnContent: `
                if(PageShell.BOOTSTRAP_VERSION == ''){
                    try
                    {
                        PageShell.BOOTSTRAP_VERSION = bootstrap.Tooltip.VERSION
                        PageShell.BOOTSTRAP_VERSION_NUMBER = parseFloat(bootstrap.Tooltip.VERSION)
                    }catch(e){
                        console.error('bootstrap.Tooltip.VERSION not found: ' + e.message)
                    }
                }`
        }).call()
    }

    /**defaults: '/lib/' */
    public static LIB_ROOT = '/lib/'

    private baseDocument: Document;
    public importedLibs: NativeLib[];
    private page: UIPage;

    private appStorageProvider: IAppStorageProvider = null;

    private appContainer: HTMLDivElement;
    private splitContainer: HTMLDivElement;

    public static BOOTSTRAP_VERSION = '';
    public static BOOTSTRAP_VERSION_NUMBER = 0.0;

    public static DISABLE_ANIMATION = false;

    constructor(mainDocument: Document, fsPage: UIPage) 
    {
        this.baseDocument = mainDocument;
        this.importedLibs = [];
        this.page = fsPage;


    }

    /**
     * Called from the `UIPage` implementation, 
     * enables the Storage feature, 
     * indicating a implementation of the `IAppStorageProvider` interface
     * @param provider 
     */
    public setStorageProvider(provider: IAppStorageProvider): void
    {
        this.appStorageProvider = provider;
    }

    /**
     * Called from the UIView or other high consumer-classes, requests an instance of `AppStorage` 
     * which must be resolved by the implementation of `IAppStorageProvider` 
     * (usually the same one that implements `UIPage`)
     * @param type `'local'` to LocalStorage or `'session'` to  SessionStorage
     * @param schemaName A unique name to demarcate a data context
     * @returns `AppStorage` instance
     */
    public requestStorage(type: string, schemaName: string): AppStorage
    {
        return this.appStorageProvider.onStorageRequested(type, schemaName);
    }

    /**
     * Enables the SplitView feature and allows two 
     * UIViews to be loaded simultaneously side-by-side on the page.
     * 
     * You must have marked this `<div id="app/split" />` previously in your HTML file.
     * 
     * @param appContainerId Id of the page's main app container div. The div that will display most UIView's in your app
     * @param splitContainerId Split container div id. The secondary UIView will be loaded in this Div
     */
    public enableSplitting(appContainerId: string, splitContainerId: string): void
    {
        this.appContainer = this.elementById(appContainerId) as HTMLDivElement;
        this.splitContainer = this.elementById(splitContainerId) as HTMLDivElement;

        if (this.splitContainer == null)
            throw new Error(`enable split fail: container Id '${splitContainerId}' not found in document. An div tag with this Id maybe not present.`);

        this.splitContainer.style.width = '0 px';
        this.splitContainer.hidden = true;
    }

    private currentViewSplitted: boolean = false;

    /**
     * Determines if SplitView is currently active
     */
    public isViewSplitted(): boolean
    {
        return this.currentViewSplitted;
    }

    /**
     * Sets the currently Splitted UIView to a reduced size
     * This will only work if `PageShell.isViewSplitted()` is `true`.
     */
    public shrinkSplitView()
    {
        if (this.currentViewSplitted == false) return;

        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function ()
        {
            self.appContainer.classList.remove('col-6');
            self.appContainer.classList.add('col-9');

            self.splitContainer.classList.remove('col-6');
            self.splitContainer.classList.add('col-3');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
    }

    /**
     * Sets the currently Splitted UIView to a side-by-side size (50%)
     */
    public expandSplitView()
    {
        if (this.currentViewSplitted == false) return;

        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function ()
        {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-6');

            self.splitContainer.classList.remove(...self.splitContainer.classList);
            self.splitContainer.classList.add('col-6');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
    }

    /**
     * Initializes a new UIView alongside the currently displayed UIView via SplitView features
     * @param ownerSplitView UIView currently displayed
     * @param splittedCallingView  New UIView that will be displayed next to the current one
     */
    public requestSplitView(splittedCallingView: UIView | UIFlatView | YordView): void
    {
        if (this.currentViewSplitted) return;

        var self = this;
        this.splitContainer.hidden = false;
        this.splitContainer.style.removeProperty('width')
        var interv = setInterval(function ()
        {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-9');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';

        if (splittedCallingView instanceof UIFlatView) UIFlatView.load(splittedCallingView)
        else if (splittedCallingView instanceof UIView) this.navigateToView(splittedCallingView as unknown as UIView)
        else if (splittedCallingView instanceof YordView)
        {
            const ctx = new YordViewContext(this)
            ctx.addView(splittedCallingView)
            ctx.goTo((splittedCallingView as unknown as YordView).viewName)
        }
        else throw new Error(`requestSplitView(): Unsupported instance of 'splittedCallingView' parameter`)
    }

    /**
     * Fully collapse the SplitView Div and destroy the currently used UIView with Split
     */
    public closeSplitView()
    {
        if (this.currentViewSplitted == false) return;

        var self = this;
        this.splitContainer.innerHTML = '';
        this.splitContainer.hidden = true;
        var interv = setInterval(function ()
        {
            self.splitContainer.classList.remove(...self.splitContainer.classList);
            self.splitContainer.classList.add('col-3');

            self.appContainer.classList.remove(...self.appContainer.classList);

            self.appContainer.classList.add('col-12');
            clearInterval(interv);
        });
        this.currentViewSplitted = false;

    }

    /**
     * Creates (say "instance") a new HTMLElement object that represents an original HTML tag with its properties and attributes
     * @param tagName The exact name of the desired HTML5 tag
     * @param innerText (Optional) an initial text inserted as tag content (if the html element supports it)
     * @returns 
     */
    public createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, innerText?: string)
    {
        var element = this.baseDocument.createElement(tagName);
        if (innerText != null)
            element.innerText = innerText;
        return element;
    }

    /**
     * Renders and brings to the front a view generated by a UIView object
     * @param view 
     */
    public navigateToView(view: UIView, preventClear: boolean = false): void
    {
        this.page.navigateToView(view, preventClear);
    }

    /**
     * Get the `<body>` of the page
     * @returns 
     */
    public getPageBody(): Element
    {
        return this.elementsByTagName('body')[0];
    }

    public elementsByTagName(tagName: string): HTMLCollectionOf<Element>
    {
        return this.baseDocument.getElementsByTagName(tagName);
    }

    public elementById(elementId: string): Element
    {
        return this.baseDocument.getElementById(elementId);
    }

    public appendChildToElement(containerElement: Element, childElement: Element): Element
    {
        return containerElement.appendChild(childElement);
    }

    public removeChildFromElement(containerElement: Element, childElement: Element): Element
    {
        return containerElement.removeChild(childElement);
    }

    public getImportedLib({ js: jsPath = null, css: cssPath = null }: {
        js?: string,
        css?: string
    }): NativeLib
    {
        if (this.importedLibs == undefined) return;
        for (var i = 0; i < this.importedLibs.length; i++)
        {
            if (!Misc.isNullOrEmpty(jsPath))
                if (this.importedLibs[i].getJsFullPath() == jsPath)
                    return this.importedLibs[i];

            if (!Misc.isNullOrEmpty(cssPath))
                if (this.importedLibs[i].getCssFullPath() == cssPath)
                    return this.importedLibs[i];
        }
        return null;
    }

    /**
     * Import a native JS-CSS library into the page, 
     * specifying the name and paths to the 
     * .js and .css content files
     */
    public import(lib: NativeLib): void
    {
        if (lib.libName != '')
        {
            var existing = this.getImportedLib({ js: lib.getJsFullPath(), css: lib.getCssFullPath() });
            if (existing !== null)
                return;
        }

        if (lib.hasCss)
        {
            var link: HTMLLinkElement = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = lib.getCssFullPath();

            document.head.appendChild(link);
        }

        if (lib.hasJs)
        {
            var jsImport: HTMLScriptElement = document.createElement('script');
            jsImport.src = lib.getJsFullPath();
            jsImport.type = 'text/javascript'

            document.body.appendChild(jsImport);
        }

        this.importedLibs.push(lib);
    }

    public removeImport(libName: string)
    {
        const libs: NativeLib[] = this.getImportedLibByName(libName);
        for (var i = 0; i < libs.length; i++)
        {
            const lib = libs[i];
            if (lib.hasCss)
            {
                for (var c = 0; c < document.head.childNodes.length; c++)
                {
                    let child = document.head.childNodes[c];
                    if (child instanceof HTMLLinkElement)
                    {
                        let link = child as unknown as HTMLLinkElement;
                        if (link.href == lib.getCssFullPath())
                            link.remove();
                    }
                }
            }

            if (lib.hasJs)
            {
                for (var c = 0; c < document.body.childNodes.length; c++)
                {
                    let child = document.body.childNodes[c];
                    if (child instanceof HTMLScriptElement)
                    {
                        let scriptEl = child as unknown as HTMLScriptElement;
                        if (scriptEl.src == lib.getJsFullPath())
                            scriptEl.remove();
                    }
                }
            }
            this.importedLibs.splice(i, 1);
        }
    }

    public getImportedLibByName(libName: string): NativeLib[]
    {
        if (this.importedLibs == undefined) return [];
        let result: NativeLib[] = [];

        for (var i = 0; i < this.importedLibs.length; i++)
        {
            const imported = this.importedLibs[i];
            if (imported.libName == libName)
                result.push(imported);
        }
        return result;
    }
}