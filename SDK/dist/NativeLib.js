"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.NativeLib = void 0;
/**
 * Used to do library imports (reference CSS and JavaScript) in a single function.
 *
 * A few JavaScript libraries may not work properly
 * due to the way your code initializes them.
 * At this time, you should resort to
 * `<script />` import directly into
 * the .HTML page.
 */
class NativeLib {
    /**
     * Library to be imported.\
     * NOTE!!!: the root-path considered here is `'/lib/'` and this is determined by the static variable `PageShell.LIB_ROOT`
     * @param libName The library folder itself
     * @param cssPath The name (or subpath) of the library's .css file. If not, ignore this parameter.
     * @param jsPath The name (or subpath) of the library's .js file. If not, ignore this parameter.
     */
    constructor({ libName = '', cssPath = '', jsPath = '' }) {
        this.libName = libName;
        this.cssPath = cssPath;
        this.jsPath = jsPath;
        this.hasCss = (cssPath != '' && cssPath != null);
        this.hasJs = (jsPath != '' && jsPath != null);
    }
    getCssFullPath() {
        if (Misc.isNullOrEmpty(this.cssPath))
            return '';
        return `${PageShell.LIB_ROOT}${this.libName}/${this.cssPath}`;
    }
    getJsFullPath() {
        if (Misc.isNullOrEmpty(this.jsPath))
            return '';
        return `${PageShell.LIB_ROOT}${this.libName}/${this.jsPath}`;
    }
    toString() {
        return this.libName;
    }
}
//exports.NativeLib = NativeLib;
