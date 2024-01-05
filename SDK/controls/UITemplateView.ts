import { Widget } from "../Widget";
import { PageShell } from "../PageShell";
import { ViewDictionaryEntry } from "../ViewDictionaryEntry";
import { Misc } from "../Misc";

export class UITemplateView 
{
    public templateDOM: Document;
    public templateString: string;

    private viewDictionary: Array<ViewDictionaryEntry>;
    private shellPage: PageShell;

    /**
     * 
     * @param htmlContent 
     * @param shell 
     * @param data 
     */
    constructor(htmlContent: string, shell: PageShell, data?:any|object)
    {
        this.shellPage = shell;
        this.viewDictionary = [];
        //  this.parentFragment.clear();

        var html: string = htmlContent;

        if(!Misc.isNull(data))
        {
            for (var prop in data)
            {
                var find = `#${prop}`;
                while (html.indexOf(find) != -1)
                    html = html.replace(find, data[prop])
            }
        }

        var parser = new DOMParser();
        var domObj = parser.parseFromString(html, "text/html");
        var allIds = domObj.querySelectorAll('*[id]');

        for (var i = 0; i < allIds.length; i++)
        {
            var element = allIds[i];
            var currentId = element.getAttribute('id');
            if (currentId != null)
            {
                var newId = `${currentId}_${Widget.generateUUID()}`;
                this.addDictionaryEntry(currentId, newId);
                element.setAttribute('id', newId);
            }
        }

        this.templateDOM = domObj;
        this.templateString = domObj.children[0].outerHTML;
    }

    public content(): Element
    {
        return this.templateDOM.children[0];
    }

    public elementById<TElement>(elementId: string): TElement
    {
       for (var i = 0; i < this.viewDictionary.length; i++)
        {
            var entry: ViewDictionaryEntry = this.viewDictionary[i];
            if (entry.getOriginalId() == elementId)
            {
                var elementResult: any = this.templateDOM.getElementById(entry.getManagedId());
                if(Misc.isNull(elementResult))
                    elementResult = document.getElementById(entry.getManagedId())
                return elementResult;
            }
        }
        return null as unknown as TElement;
    }

    private addDictionaryEntry(originalId: string, generatedId: string)
    {
        var entry = new ViewDictionaryEntry(originalId, generatedId);
        this.viewDictionary.push(entry);
    }
}