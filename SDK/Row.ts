import { Column } from "./Column";
import { FSWidget } from "./FSWidget";
import { Misc } from "./Misc";
import { StyleProperty } from "./StyleProperty";
import { ViewLayout } from "./ViewLayout";


export class RowOptions
{
    rowHeidth?: string;
    rowClass?: string;

    columns?: Column[] = [];

    constructor()
    {
        this.rowClass = 'row';
    }
}


export class Row
{

    id: string;
    rowClass: string = 'row';
    rowWidth: string;
    rowHeidth: string;
    flexGrow1: boolean;
    rowColumns: Column[] = [];

    generatedColumnId: string;

    constructor(id: string, options: RowOptions)
    {
        this.id = id;

        if (Misc.isNullOrEmpty(options.rowClass) == false)
            this.rowClass = options.rowClass;
        if (Misc.isNullOrEmpty(options.rowHeidth) == false)
            this.rowHeidth = options.rowHeidth;
        if (Misc.isNull(options.columns) == false)
            this.rowColumns = options.columns;

        if ((this.rowColumns == null || this.rowColumns == undefined) || this.rowColumns.length == 0)
        {
            if (ViewLayout.AUTO_GENERATE_COLUMNS)
            {
                var id: string = `col_${FSWidget.generateUUID()}`;
                this.generatedColumnId = id;
                this.rowColumns = [
                    new Column(id, { colClass: 'col-md-12 col-xs-12 col-lg-12 col-sm-12' })
                ];
            }
        }
        else
        {
            for (var i = 0; i < this.rowColumns.length; i++)
            {
                var column: Column = this.rowColumns[i];
                if (Misc.isNullOrEmpty(column.colClass))
                    column.colClass = 'col-md-12 col-xs-12 col-lg-12 col-sm-12'
            }
        }
    }
}
