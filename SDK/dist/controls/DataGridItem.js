"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.DataGridItem = void 0;
class DataGridItem {
    constructor(name, model, pageShell) {
        this.selected = false;
        this.pageShell = pageShell;
        this.itemName = name;
        this.value = model;
    }
    setOwnerDataGrid(dataGrid) {
        this.ownerDatagrid = dataGrid;
    }
    isSelected() {
        return this.selected;
    }
    select() {
        this.selected = true;
        this.rowElement.style.background = this.ownerDatagrid.selectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.selectedForeColor;
    }
    unSelect() {
        this.selected = false;
        this.rowElement.style.background = this.ownerDatagrid.unselectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.unselectedForeColor;
    }
    itemTemplate() {
        var self = this;
        if (self.rowElement != null)
            return self.rowElement;
        var model = self.value;
        var tr = self.pageShell.createElement('tr');
        for (var k = 0; k < this.ownerDatagrid.MODEL_KEYS.length; k++) {
            var key = this.ownerDatagrid.MODEL_KEYS[k];
            var td = this.pageShell.createElement('td');
            td.innerText = model[key];
            tr.appendChild(td);
        }
        tr.onclick = function (ev) {
            self.ownerDatagrid.onRowClick(self);
        };
        self.rowElement = tr;
        return tr;
    }
}
//exports.DataGridItem = DataGridItem;
