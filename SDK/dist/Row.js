"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.Row = //exports.RowOptions = void 0;
class RowOptions {
    constructor() {
        this.columns = [];
        this.rowClass = 'row';
    }
}
//exports.RowOptions = RowOptions;
/**
 * Represents a Row Div with standard Bootstrap class options
 */
class Row {
    /**
     *
     * @param id A div-container Id to parent this
     * @param options Row options like class, height and sub-columns; NOTE: if no column is provided, it may be that at least
     * one column is generated automatically. To determine this,
     * check the static variable `ViewLayout.AUTO_GENERATE_COLUMNS`
     */
    constructor(id, options) {
        this.rowClass = 'row';
        this.rowColumns = [];
        this.id = id;
        if (Misc.isNullOrEmpty(options.rowClass) == false)
            this.rowClass = options.rowClass;
        if (Misc.isNullOrEmpty(options.rowHeidth) == false)
            this.rowHeidth = options.rowHeidth;
        if (Misc.isNull(options.columns) == false)
            this.rowColumns = options.columns;
        if ((this.rowColumns == null || this.rowColumns == undefined) || this.rowColumns.length == 0) {
            if (ViewLayout.AUTO_GENERATE_COLUMNS) {
                var id = `col_${Widget.generateUUID()}`;
                this.generatedColumnId = id;
                this.rowColumns = [
                    new Col(id, { colClass: 'col-md-12 col-xs-12 col-lg-12 col-sm-12' })
                ];
            }
        }
        else {
            for (var i = 0; i < this.rowColumns.length; i++) {
                var column = this.rowColumns[i];
                if (Misc.isNullOrEmpty(column.colClass))
                    column.colClass = 'col-md-12 col-xs-12 col-lg-12 col-sm-12';
            }
        }
    }
}
//exports.Row = Row;
