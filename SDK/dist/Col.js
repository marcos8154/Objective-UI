"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.Col = //exports.ColOptions = void 0;
/**
 * Initialization options for div-columns
 */
class ColOptions {
}
//exports.ColOptions = ColOptions;
/**
 * Represents a Column-Div with standard Bootstrap classes and a height of 100px
 */
class Col {
    /**
     *
     * @param id The 'Id' attribute that the resulting div will have
     * @param options
     */
    constructor(id, options) {
        this.colClass = 'col-lg-12 col-md-12 col-sm-12 col-sm-12';
        this.colHeight = '100px';
        this.columnRows = [];
        this.id = id;
        if (options != null) {
            if (Misc.isNullOrEmpty(options.colHeight) == false)
                this.colHeight = options.colHeight;
            if (Misc.isNullOrEmpty(options.colClass) == false)
                this.colClass = options.colClass;
            if (options.rows !== null)
                this.columnRows = options.rows;
        }
    }
    toString() {
        return 'BT-COLUMN';
    }
}
//exports.Col = Col;
