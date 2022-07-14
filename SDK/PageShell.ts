import { AppStorage } from "./AppStorage";
import { UIPage } from "./UIPage";
import { UIView } from "./UIView";
import { IAppStorageProvider } from "./IAppStorageProvider";
import { ISplittableView } from "./ISplittableView";
import { NativeLib as NativeLib } from "./NativeLib";


/**
 * PageShell is a class that works at the lowest level (next to the page)
 * and performs some tasks in the DOM interface such as 
 * creating/finding/removing elements, 
 * directly importing native JS-CSS libraries 
 * and controlling access to resources such as SplitView, Storage and others.
 */
export class PageShell
{

    /**defaults: '/lib/' */
    public static LIB_ROOT = '/lib/'

    private baseDocument: Document;
    public importedLibs: NativeLib[];
    private page: UIPage;

    private appStorageProvider: IAppStorageProvider = null;

    private appContainer: HTMLDivElement;
    private splitContainer: HTMLDivElement;

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
    public requestSplitView(ownerSplitView: ISplittableView, splittedCallingView: UIView): void
    {
        if (this.currentViewSplitted) return;

        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function ()
        {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-9');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
        this.navigateToView((splittedCallingView as unknown) as UIView);

        (splittedCallingView as unknown as ISplittableView).onConnectViews(ownerSplitView);
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
    public navigateToView(view: UIView): void
    {
        this.page.navigateToView(view);
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

    public getImportedLib(libName: string): NativeLib
    {
        if (this.importedLibs == undefined) return;
        for (var i = 0; i < this.importedLibs.length; i++)
            if (this.importedLibs[i].libName == libName)
                return this.importedLibs[i];
        return null;
    }

    /**
     * Import a native JS-CSS library into the page, 
     * specifying the name and paths to the 
     * .js and .css content files
     */
    public import(lib: NativeLib): void
    {
        var existing = this.getImportedLib(lib.libName);
        if (existing !== null)
            return;

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

            document.body.appendChild(jsImport);
        }

        this.importedLibs.push(lib);
    }
}