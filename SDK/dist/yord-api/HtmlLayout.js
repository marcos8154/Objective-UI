"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.HtmlLayout = void 0;
class HtmlLayout {
    constructor(containerDivId, rawHtmlString) {
        this.htmlString = '';
        this.containerDivId = '';
        this.htmlString = rawHtmlString;
        this.containerDivId = containerDivId;
    }
    getLayout() {
        return new ViewLayout(this.containerDivId)
            .fromHTML(this.htmlString);
    }
}
//exports.HtmlLayout = HtmlLayout;
