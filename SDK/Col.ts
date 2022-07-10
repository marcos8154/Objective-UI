import { Misc } from "./Misc";
import { Row } from "./Row";
import { StyleProperty } from "./StyleProperty";


/**
 * Initialization options for div-columns
 */
export class ColOptions
{
    colClass?: string;
    colHeight?: string;
    rows?: Row[];
}


/**
 * Represents a Column-Div with standard Bootstrap classes and a height of 100px
 */
export class Col
{
    id: string;
    colClass?: string = 'col-lg-12 col-md-12 col-sm-12 col-sm-12';
    colHeight?: string = '100px';
    columnRows?: Row[] = [];

    /**
     * 
     * @param id The 'Id' attribute that the resulting div will have
     * @param options 
     */
    constructor(id: string, options?: ColOptions)
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
