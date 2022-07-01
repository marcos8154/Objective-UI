import { ILayoutPresenter } from './ILayoutPresenter'
import { ViewLayout } from './ViewLayout';
import { Row } from "./Row";
import { PageShell } from './PageShell';
import { StyleProperty } from './StyleProperty';
import { Column } from './Column';
import { Misc } from './Misc';

export class DefaultLayoutPresenter implements ILayoutPresenter
{
    presenter: DefaultLayoutPresenter;
    private pageShell: PageShell;

    constructor()
    {
        this.presenter = this;
    }


    renderLayout(layout: ViewLayout, pageShell: PageShell): Element
    {
        this.pageShell = pageShell;
        var parentContainer: HTMLDivElement = layout.containerDivObj as HTMLDivElement;

        if (parentContainer == null) return null;

        parentContainer.innerHTML = '';
        // parentContainer.style.opacity = '0';

        for (let rowIndex = 0; rowIndex < layout.layoutRows.length; rowIndex++)
        {
            var rowObj: Row = layout.layoutRows[rowIndex];
            var rowView = this.renderRow(rowObj);
            parentContainer.appendChild(rowView);
        }

        return parentContainer;
    }

    private renderRow(row: Row): HTMLDivElement
    {

        //creates master row div
        const rowDiv: HTMLDivElement = document.createElement("div");
        if (row.rowClass != null && row.rowClass != undefined)
        {
            const classes: Array<string> = row.rowClass.split(' ');
            for (var i = 0; i < classes.length; i++)
            {
                const className = classes[i].trim();
                if (className == '') continue;
                rowDiv.classList.add(className);
            }
        }

        rowDiv.id = row.id;
        rowDiv.style.height = row.rowHeidth;

        if (row.rowColumns != null)
        {
            for (let index = 0; index < row.rowColumns.length; index++)
            {
                const column: Column = row.rowColumns[index];

                //an sub-div column
                const colDiv: HTMLDivElement = document.createElement("div");

                if (Misc.isNullOrEmpty(column.colClass) == false)
                {
                    const classes: Array<string> = column.colClass.split(' ');
                    for (var i = 0; i < classes.length; i++)
                    {
                        const className = classes[i].trim();
                        if(className == '') continue;
                        colDiv.classList.add(className);
                    }
                }

                colDiv.id = column.id;
                colDiv.style.height = column.colHeight;

                rowDiv.appendChild(colDiv);

                if (column.columnRows != null)
                {
                    for (let subRowIndex = 0; subRowIndex < column.columnRows.length; subRowIndex++)
                    {
                        //sub-div column has rows
                        const columnSubRow = column.columnRows[subRowIndex];

                        //recursivelly call renderRow() again,
                        const subRowElement = this.renderRow(columnSubRow);

                        //then catch Element result and append it to sub-div column (aka "colDiv")

                        if (subRowElement != null)
                            colDiv.appendChild(subRowElement);
                    }
                }
            }
        }
        return rowDiv;
    }
}