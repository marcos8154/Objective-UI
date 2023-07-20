"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.ViewLayout = void 0;
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
class ViewLayout {
    /**
     *
     * @param containerDivId Provide the 'Id' of the Div that will contain this layout (and consequently the Widgets elements)
     * @param rows Provide root rows for this layout. Ignore this parameter if you want to provide the layout from raw-html content (via `ViewLayout().fromHTML()`)
     */
    constructor(containerDivId, rows) {
        this.fromString = false;
        this.layoutPresenter = new DefaultLayoutPresenter();
        this.layoutRows = rows;
        this.containerDivName = containerDivId;
    }
    getRow(rowId) {
        if (this.fromString)
            throw new Error('getRow() is not supported when layout is output over raw html string');
        for (var i = 0; i < this.layoutRows.length; i++)
            if (this.layoutRows[i].id == rowId)
                return this.layoutRows[i];
        return null;
    }
    fromHTML(rawHtmlLayoutString) {
        this.fromString = true;
        this.rawHtml = rawHtmlLayoutString;
        return this;
    }
    render(shellPage, customPresenter) {
        this.containerDivObj = shellPage.elementById(this.containerDivName);
        if (this.fromString) {
            var parser = new DOMParser();
            var dom = parser.parseFromString(this.rawHtml, 'text/html');
            this.layoutDOM = dom;
            this.containerDivObj.innerHTML = '';
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
    ElementsIdCollection() {
        if (this.fromString) {
            var idCollection = [];
            var nodesWithId = this.containerDivObj.querySelectorAll('*[id]');
            for (var i = 0; i < nodesWithId.length; i++)
                idCollection.push(nodesWithId[i].id);
            return idCollection;
        }
        return this.ScanRows(this.layoutRows);
    }
    ScanRows(rows) {
        var result = [];
        if (rows !== undefined) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                result.push(row.id);
                if (row.rowColumns !== undefined) {
                    var cols = this.ScanColumns(row.rowColumns);
                    for (var c = 0; c < cols.length; c++)
                        result.push(cols[c]);
                }
            }
        }
        return result;
    }
    ScanColumns(columns) {
        var result = [];
        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            result.push(col.id);
            if (col.columnRows !== null) {
                var rows = this.ScanRows(col.columnRows);
                for (var r = 0; r < rows.length; r++)
                    result.push(rows[r]);
            }
        }
        return result;
    }
}
//exports.ViewLayout = ViewLayout;
ViewLayout.AUTO_GENERATE_COLUMNS = false;
