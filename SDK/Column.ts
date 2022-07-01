import { Misc } from "./Misc";
import { Row } from "./Row";
import { StyleProperty } from "./StyleProperty";

export class ColumnOptions
{
    //    id: string;
    colClass?: string;
    colHeight?: string;
    rows?: Row[];
}

export class Column
{
    id: string;
    colClass?: string = 'col-lg-12 col-md-12 col-sm-12 col-sm-12';
    colHeight?: string = '100px';
    columnRows?: Row[] = [];

    constructor(id: string, options?: ColumnOptions)
    {
        this.id = id;

        if (options != null)
        {
            if (Misc.isNullOrEmpty(options.colHeight) == false)
                this.colHeight = options.colHeight;

            if (Misc.isNullOrEmpty(options.colClass) == false)
                this.colClass = options.colClass;

            if (options.rows !== null)
                this.columnRows = options.rows;
        }
    }
}
