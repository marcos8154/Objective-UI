import { AppStorage } from "./AppStorage";
import { Page } from "./Page";
import { View } from "./UIView";
import { IAppStorageProvider } from "./IAppStorageProvider";
import { ISplittableView } from "./ISplittableView";
import { NativeLib as NativeLib } from "./NativeLib";

export class PageShell {

    /**defaults: '/lib/' */
    public static LIB_ROOT = '/lib/'

    private baseDocument: Document;
    private importedLibs: NativeLib[];
    private page: Page;

    private appStorageProvider: IAppStorageProvider = null;
    
    private appContainer: HTMLDivElement;
    private splitContainer: HTMLDivElement;

    constructor(mainDocument: Document, fsPage: Page) 
    {
        this.baseDocument = mainDocument;
        this.importedLibs = [];
        this.page = fsPage;
    }

    public setStorageProvider(provider: IAppStorageProvider): void
    {
        this.appStorageProvider = provider;
    }


    public requestStorage(type: string, schemaName: string): AppStorage
    {
        return this.appStorageProvider.onStorageRequested(type, schemaName);
    }

    public enableSplitting(appContainerId: string, splitContainerId: string): void
    {
        this.appContainer = this.elementById(appContainerId) as HTMLDivElement;
        this.splitContainer = this.elementById(splitContainerId) as HTMLDivElement;

        if(this.splitContainer == null)
            throw new Error(`enable split fail: container Id '${splitContainerId}' not found in document. An div tag with this Id maybe not present.`);

        this.splitContainer.style.width = '0 px';
        this.splitContainer.hidden = true;
    }

    private currentViewSplitted: boolean = false;

    public isViewSplitted() : boolean
    {
         return this.currentViewSplitted;
    }

    public shrinkSplitView(ownerSplitView: ISplittableView)
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

    public expandSplitView(ownerSplitView: ISplittableView)
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

    public requestSplitView(ownerSplitView: ISplittableView, splittedCallingView: View)
    {
        if (this.currentViewSplitted) return;
 
        var self = this;
        this.splitContainer.hidden = false;
        var interv =   setInterval(function ()
        {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-9');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
        this.navigateToView((splittedCallingView as unknown) as View);
        
        (splittedCallingView as unknown as ISplittableView).onConnectViews(ownerSplitView);
    }

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

    public createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, innerText?: string)
    {
        var element = this.baseDocument.createElement(tagName);
        if(innerText != null)
           element.innerText = innerText;
        return element;
    }

    public navigateToView(view:View): void
    {
        this.page.navigateToView(view);
    }

    public getPageBody(): Element
    {
        return this.elementsByTagName('body')[0];
    }

    public elementsByTagName(tagName: string) : HTMLCollectionOf<Element> {
        return this.baseDocument.getElementsByTagName(tagName);
    }

    public elementById(elementId: string): Element {
        return this.baseDocument.getElementById(elementId);
    }

    public appendChildToElement(containerElement: Element, childElement: Element): Element {
        return containerElement.appendChild(childElement);
    }

    public removeChildFromElement(containerElement: Element, childElement: Element): Element {
        return containerElement.removeChild(childElement);
    }

    public getImportedLib(libName: string): NativeLib {
        if (this.importedLibs == undefined) return;
        for (var i = 0; i < this.importedLibs.length; i++)
            if (this.importedLibs[i].libName == libName)
                return this.importedLibs[i];
        return null;
    }

    public import(lib: NativeLib): void {
        var existing = this.getImportedLib(lib.libName);
        if (existing !== null)
            return;

        if (lib.hasCss) {
            var link: HTMLLinkElement = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = lib.getCssFullPath();

            document.head.appendChild(link);
        }

        if (lib.hasJs) {
            var jsImport: HTMLScriptElement = document.createElement('script');
            jsImport.src = lib.getJsFullPath();

            document.body.appendChild(jsImport);
        }

        this.importedLibs.push(lib);
    }
}