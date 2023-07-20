"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.PageShell = void 0;
/**
 * PageShell is a class that works at the lowest level (next to the page)
 * and performs some tasks in the DOM interface such as
 * creating/finding/removing elements,
 * directly importing native JS-CSS libraries
 * and controlling access to resources such as SplitView, Storage and others.
 */
class PageShell {
    constructor(mainDocument, fsPage) {
        this.appStorageProvider = null;
        this.currentViewSplitted = false;
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
    setStorageProvider(provider) {
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
    requestStorage(type, schemaName) {
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
    enableSplitting(appContainerId, splitContainerId) {
        this.appContainer = this.elementById(appContainerId);
        this.splitContainer = this.elementById(splitContainerId);
        if (this.splitContainer == null)
            throw new Error(`enable split fail: container Id '${splitContainerId}' not found in document. An div tag with this Id maybe not present.`);
        this.splitContainer.style.width = '0 px';
        this.splitContainer.hidden = true;
    }
    /**
     * Determines if SplitView is currently active
     */
    isViewSplitted() {
        return this.currentViewSplitted;
    }
    /**
     * Sets the currently Splitted UIView to a reduced size
     * This will only work if `PageShell.isViewSplitted()` is `true`.
     */
    shrinkSplitView() {
        if (this.currentViewSplitted == false)
            return;
        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function () {
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
    expandSplitView() {
        if (this.currentViewSplitted == false)
            return;
        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function () {
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
    requestSplitView(ownerSplitView, splittedCallingView) {
        if (this.currentViewSplitted)
            return;
        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function () {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-9');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;
        self.splitContainer.style.borderLeft = '3px solid gray';
        this.navigateToView(splittedCallingView);
        splittedCallingView.onConnectViews(ownerSplitView);
    }
    /**
     * Fully collapse the SplitView Div and destroy the currently used UIView with Split
     */
    closeSplitView() {
        if (this.currentViewSplitted == false)
            return;
        var self = this;
        this.splitContainer.innerHTML = '';
        this.splitContainer.hidden = true;
        var interv = setInterval(function () {
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
    createElement(tagName, innerText) {
        var element = this.baseDocument.createElement(tagName);
        if (innerText != null)
            element.innerText = innerText;
        return element;
    }
    /**
     * Renders and brings to the front a view generated by a UIView object
     * @param view
     */
    navigateToView(view) {
        this.page.navigateToView(view);
    }
    /**
     * Get the `<body>` of the page
     * @returns
     */
    getPageBody() {
        return this.elementsByTagName('body')[0];
    }
    elementsByTagName(tagName) {
        return this.baseDocument.getElementsByTagName(tagName);
    }
    elementById(elementId) {
        return this.baseDocument.getElementById(elementId);
    }
    appendChildToElement(containerElement, childElement) {
        return containerElement.appendChild(childElement);
    }
    removeChildFromElement(containerElement, childElement) {
        return containerElement.removeChild(childElement);
    }
    getImportedLib({ js: jsPath = null, css: cssPath = null }) {
        if (this.importedLibs == undefined)
            return;
        for (var i = 0; i < this.importedLibs.length; i++) {
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
    import(lib) {
        if (lib.libName != '') {
            var existing = this.getImportedLib({ js: lib.getJsFullPath(), css: lib.getCssFullPath() });
            if (existing !== null)
                return;
        }
        if (lib.hasCss) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = lib.getCssFullPath();
            document.head.appendChild(link);
        }
        if (lib.hasJs) {
            var jsImport = document.createElement('script');
            jsImport.src = lib.getJsFullPath();
            jsImport.type = 'text/javascript';
            document.body.appendChild(jsImport);
        }
        this.importedLibs.push(lib);
    }
    removeImport(libName) {
        const libs = this.getImportedLibByName(libName);
        for (var i = 0; i < libs.length; i++) {
            const lib = libs[i];
            if (lib.hasCss) {
                for (var c = 0; c < document.head.childNodes.length; c++) {
                    let child = document.head.childNodes[c];
                    if (child instanceof HTMLLinkElement) {
                        let link = child;
                        if (link.href == lib.getCssFullPath())
                            link.remove();
                    }
                }
            }
            if (lib.hasJs) {
                for (var c = 0; c < document.body.childNodes.length; c++) {
                    let child = document.body.childNodes[c];
                    if (child instanceof HTMLScriptElement) {
                        let scriptEl = child;
                        if (scriptEl.src == lib.getJsFullPath())
                            scriptEl.remove();
                    }
                }
            }
            this.importedLibs.splice(i, 1);
        }
    }
    getImportedLibByName(libName) {
        if (this.importedLibs == undefined)
            return [];
        let result = [];
        for (var i = 0; i < this.importedLibs.length; i++) {
            const imported = this.importedLibs[i];
            if (imported.libName == libName)
                result.push(imported);
        }
        return result;
    }
}
//exports.PageShell = PageShell;
/**defaults: '/lib/' */
PageShell.LIB_ROOT = '/lib/';
