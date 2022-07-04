import { PageShell } from "../PageShell";
import { UIDataGrid } from "./UIDataGrid";
import { IDataGridItemTemplate } from "./IDataGridItemTemplate";

export class DataGridItem implements IDataGridItemTemplate
{
    public value: any;
    public itemName: string;
    private ownerDatagrid: UIDataGrid;
    public rowElement: HTMLTableRowElement;
    private pageShell: PageShell;

    private selected: boolean = false;

    constructor(name: string,
        model: any | object,
        pageShell: PageShell)
    {
        this.pageShell = pageShell;
        this.itemName = name;
        this.value = model;
    }

    setOwnerDataGrid(dataGrid: UIDataGrid): void
    {
        this.ownerDatagrid = dataGrid;
    }
    isSelected(): boolean
    {
        return this.selected;
    }
    select(): void
    {
        this.selected = true;
        this.rowElement.style.background = this.ownerDatagrid.selectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.selectedForeColor;
    }
    unSelect(): void
    {
        this.selected = false;
        this.rowElement.style.background = this.ownerDatagrid.unselectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.unselectedForeColor;
    }
    itemTemplate(): HTMLTableRowElement
    {
        var self = this;
        if (self.rowElement != null)
            return self.rowElement;

        var model = self.value;
        var tr = self.pageShell.createElement('tr')
        
        for (var k = 0; k < this.ownerDatagrid.MODEL_KEYS.length; k++)
        {
            var key = this.ownerDatagrid.MODEL_KEYS[k];
            var td = this.pageShell.createElement('td');

            td.innerText = model[key];
            tr.appendChild(td);
        }
        tr.onclick = function (ev)
        {
            self.ownerDatagrid.onRowClick(self);
        };

        self.rowElement = tr;
        return tr;
    }
}