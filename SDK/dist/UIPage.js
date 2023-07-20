"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIPage = void 0;
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
class UIPage {
    constructor(doc) {
        this.mainShell = new PageShell(doc, this);
        console.info(`* * * Objective-UI v${UIPage.PRODUCT_VERSION} * * *`);
    }
    setStorageProvider(provider) {
        this.mainShell.setStorageProvider(provider);
    }
    enableSplitting(appContainerId, splitContainerId) {
        this.mainShell.enableSplitting(appContainerId, splitContainerId);
    }
    setLibRoot(rootPath) {
        PageShell.LIB_ROOT = rootPath;
    }
    importLib({ libName, cssPath, jsPath }) {
        this.mainShell.import(new NativeLib({ libName, cssPath, jsPath }));
    }
    navigateToView(view) {
        try {
            view.initialize(this.mainShell);
        }
        catch (error) {
            new DefaultExceptionPage(error);
        }
    }
}
//exports.UIPage = UIPage;
UIPage.PRODUCT_VERSION = '1.0.9';
UIPage.DISABLE_EXCEPTION_PAGE = false;
