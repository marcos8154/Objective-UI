import { Col } from "./Col";
import { DefaultLayoutPresenter } from "./DefaultLayoutPresenter";
import { ILayoutPresenter } from "./ILayoutPresenter";
import { Misc } from "./Misc";
import { PageShell } from "./PageShell";
import { Row } from "./Row";
import { UIPage } from "./UIPage";


/**
 * ViewLayout is a class that logically contains a demarcation 
 * of divs that will be used by the UIView inherited class, 
 * when this View is rendered. \
 * \
 * It is possible to build the layout in the form of an object:
 * ```
new ViewLayout('app', [
    new Row('row-X', { rowClass: 'row', rowHeidth: '100px', 
        columns: [
            new Col('col-Y-left', { colClass: 'col-8',  colHeight: '80px' }),
            new Col('col-Y-right', { colClass: 'col-4', colHeight: '20px' )
        ]
    }),
])
 * ``` 
 * attributes are optional but can take on unwanted default values.
 *
 * Or directly by a raw-html string:  
 * 
 * ```
new ViewLayout('app').fromHTML(`
    <div class="row-x" style="height:100px">
        <div id="col-Y-left"  class="col-8"  style="height:80px"> </div>
        <div id="col-Y-right" class="col-4" style="height:20px"> </div>
    </div>
`);
 * ```
 */
export class ViewLayout
{
    public static AUTO_GENERATE_COLUMNS = false;


    private layoutDOM: Document;
    public layoutRows: Row[];
    public containerDivObj: Element;
    private containerDivName: string;
    private rawHtml: string;
    private fromString: boolean = false;

    private layoutPresenter: ILayoutPresenter = new DefaultLayoutPresenter();

    /**
     * 
     * @param containerDivId Provide the 'Id' of the Div that will contain this layout (and consequently the Widgets elements)
     * @param rows Provide root rows for this layout. Ignore this parameter if you want to provide the layout from raw-html content (via `ViewLayout().fromHTML()`)
     */
    constructor(containerDivId: string, rows?: Row[])
    {
        this.layoutRows = rows;
        this.containerDivName = containerDivId;
    }

    public getRow(rowId: string): Row
    {
        if (this.fromString)
            throw new Error('getRow() is not supported when layout is output over raw html string');

        for (var i = 0; i < this.layoutRows.length; i++)
            if (this.layoutRows[i].id == rowId)
                return this.layoutRows[i];
        return null as unknown as Row;
    }

    /**
     * 
     * @param rawHtmlLayoutString Raw html snippet demarcating page layout with divs
You should avoid declaring user elements directly here.
     * @param staticData (Optional) An object to provide static values in the provided html-layout snippet.
You must use '#propertyName' in the raw-html to bind to the object given here. 
You can also concatenate directly to the raw-html string. Your choice 😍.

Example:
```
this.fromHTML(`
            <div class="row">
                <div class="col-5">
                    <h5> #supplierName </h5>
                </div>
            </div>
        `, { //data obj
            id: 1,
            supplierName: 'ACC/IO Systems'
        })
```
     * @returns 
     */
    fromHTML(rawHtmlLayoutString: string, staticData?: any | object): ViewLayout
    {
        if (!Misc.isNull(staticData))
        {
            for (var prop in staticData)
            {
                rawHtmlLayoutString = rawHtmlLayoutString.replace(`#${prop}`, staticData[prop])
            }
        }

        this.fromString = true;
        this.rawHtml = rawHtmlLayoutString;
        return this;
    }


    render(shellPage: PageShell, customPresenter?: ILayoutPresenter, preventClear: boolean = false): Element
    {
        this.containerDivObj = shellPage.elementById(this.containerDivName) as HTMLDivElement;

        if (this.fromString)
        {
            var parser = new DOMParser();
            var dom: Document = parser.parseFromString(this.rawHtml, 'text/html');
            this.layoutDOM = dom;

            if (preventClear == false)
                this.containerDivObj.innerHTML = '';
            var objDom = this.layoutDOM.children[0].children[1];

            if (UIPage.DEBUG_MODE)
            {
                const lb = document.createElement('label');
                lb.textContent = ` ViewLayout: #${this.containerDivObj.id}`;
                lb.style.color = 'green';
                objDom.append(lb)
            }

            for (var i = 0; i < objDom.childNodes.length; i++)
                this.containerDivObj.appendChild(objDom.childNodes[i]);

            return objDom;
        }

        if (undefined == shellPage || null == shellPage)
            throw 'PageShell instance is required here.';
        if (undefined != customPresenter || null != customPresenter)
            this.layoutPresenter = customPresenter;

        return this.layoutPresenter.renderLayout(this, shellPage);
    }

    ElementsIdCollection(): string[]
    {
        if (this.fromString)
        {
            var idCollection: Array<string> = [];
            var nodesWithId: NodeListOf<Element> = this.containerDivObj.querySelectorAll('*[id]');
            for (var i = 0; i < nodesWithId.length; i++)
                idCollection.push(nodesWithId[i].id);
            return idCollection;
        }
        return this.ScanRows(this.layoutRows);
    }

    private ScanRows(rows: Row[]): string[]
    {
        var result: string[] = [];
        if (rows !== undefined)
        {
            for (var i = 0; i < rows.length; i++)
            {
                var row: Row = rows[i];
                result.push(row.id);

                if (row.rowColumns !== undefined)
                {
                    var cols: string[] = this.ScanColumns(row.rowColumns);
                    for (var c = 0; c < cols.length; c++)
                        result.push(cols[c]);
                }
            }
        }
        return result;
    }

    private ScanColumns(columns: Col[]): string[]
    {
        var result: string[] = [];
        for (var i = 0; i < columns.length; i++)
        {
            var col = columns[i];
            result.push(col.id);

            if (col.columnRows !== null)
            {
                var rows: string[] = this.ScanRows(col.columnRows);
                for (var r = 0; r < rows.length; r++)
                    result.push(rows[r]);
            }
        }
        return result;
    }

    /**
   * 
   * @param layoutUri /path/to/layout.html
   * @param intoCallBack callback to receive raw-html string
   * ```
   * function(html: string) {  }
   * ``` 
   */
    public static load(layoutUri: string, intoCallBack: Function)
    {
        if (!layoutUri.endsWith('.html'))
            layoutUri += '.html';

        fetch(layoutUri)
            .then(function (r)
            {
                return r.text();
            })
            .then(function (r)
            {
                intoCallBack(r);
            });
    }
}