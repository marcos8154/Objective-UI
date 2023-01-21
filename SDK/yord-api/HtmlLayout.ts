import { ViewLayout } from "../ViewLayout";
import { IYordLayout } from "./IYordLayout";

export class HtmlLayout implements IYordLayout
{
    private htmlString: string = '';
    private containerDivId: string = '';
    constructor(containerDivId: string, rawHtmlString: string) {
        this.htmlString = rawHtmlString;
        this.containerDivId = containerDivId;
    }

    getLayout(): ViewLayout
    {
        return new ViewLayout(this.containerDivId)
            .fromHTML(this.htmlString);
    }
}