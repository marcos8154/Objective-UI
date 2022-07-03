import { Column } from "./Column";
import { DefaultLayoutPresenter } from "./DefaultLayoutPresenter";
import { ILayoutPresenter } from "./ILayoutPresenter";
import { PageShell } from "./PageShell";
import { Row } from "./Row";

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

    fromHTML(rawHtmlLayoutString: string): ViewLayout
    {
        this.fromString = true;
        this.rawHtml = rawHtmlLayoutString;
        return this;
    }

    render(shellPage: PageShell, customPresenter?: ILayoutPresenter): Element
    {
        this.containerDivObj = shellPage.elementById(this.containerDivName);

        if (this.fromString)
        {
            var parser = new DOMParser();
            var dom: Document = parser.parseFromString(this.rawHtml, 'text/html');
            this.layoutDOM = dom;

            var objDom = this.layoutDOM.children[0].children[1];

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

    private ScanColumns(columns: Column[]): string[]
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
}