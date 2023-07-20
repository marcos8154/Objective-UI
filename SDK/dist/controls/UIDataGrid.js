"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIDataGrid = //exports.UIDataGridBinder = //exports.DataGridColumnDefinition = void 0;
class DataGridColumnDefinition {
}
//exports.DataGridColumnDefinition = DataGridColumnDefinition;
class UIDataGridBinder extends WidgetBinder {
    constructor(dataGrid) {
        super(dataGrid);
        this.dataGrid = dataGrid;
    }
    getWidgetValue() {
        return this.dataGrid.selectedValue();
    }
    refreshUI() {
        var viewModels = this.getModelPropertyValue();
        this.dataGrid.fromList(viewModels);
    }
    fillPropertyModel() { }
}
//exports.UIDataGridBinder = UIDataGridBinder;
class UIDataGrid extends Widget {
    constructor({ name, autoGenCols = false, itemTemplateProvider = null }) {
        super(name);
        this.selectedBackColor = '#007BFF';
        this.unselectedBackColor = '#FFFFFF';
        this.selectedForeColor = '#FFFFFF';
        this.unselectedForeColor = '#000000';
        this.items = [];
        this.MODEL_KEYS = [];
        this.templateProvider = itemTemplateProvider;
        this.autoGenerateColumns = autoGenCols;
    }
    getBinder() {
        return new UIDataGridBinder(this);
    }
    /**
     *
     * @param colDefs array of { h: 'Column Header', k: 'model_property_name' }
     */
    addColumns(colDefs) {
        this.table.tHead.innerHTML = '';
        for (var i = 0; i < colDefs.length; i++) {
            var def = colDefs[i];
            this.addColumn(def.h, def.k);
        }
    }
    setTemplateProvider(provider) {
        this.templateProvider = provider;
    }
    addColumn(columnHeader, modelKey) {
        var shell = this.getPageShell();
        this.MODEL_KEYS.push(modelKey);
        var thead = this.table.tHead;
        if (thead.childNodes.length == 0)
            thead.appendChild(shell.createElement('tr'));
        var th = shell.createElement('th', columnHeader);
        th.scope = 'col';
        thead.children[0].appendChild(th);
    }
    generateColumns(list) {
        this.autoGenerateColumns = false;
        this.table.tHead.innerHTML = '';
        this.MODEL_KEYS = [];
        var shell = this.getPageShell();
        //creating columns
        var tr = shell.createElement('tr');
        let firstModel = list[0];
        for (let key in firstModel) {
            var th = shell.createElement('th');
            th.scope = 'col';
            th.textContent = key;
            tr.appendChild(th);
            this.MODEL_KEYS.push(key);
        }
        this.table.tHead.appendChild(tr);
    }
    fromList(list) {
        this.table.tBodies[0].innerHTML = '';
        this.items = [];
        if ((list == null || list == undefined) || list.length == 0)
            return;
        var shell = this.getPageShell();
        if (this.autoGenerateColumns)
            this.generateColumns(list);
        //adding rows
        for (var i = 0; i < list.length; i++) {
            var model = list[i];
            var itemTemplate;
            if (this.templateProvider == null)
                itemTemplate = new DataGridItem(`default_datagrid_item_${i + 1}`, model, shell);
            else
                itemTemplate = this.templateProvider.getDataGridItemTemplate(this, model);
            itemTemplate.setOwnerDataGrid(this);
            this.items.push(itemTemplate);
            this.table.tBodies[0].appendChild(itemTemplate.itemTemplate());
        }
    }
    selectedItem() {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].isSelected())
                return this.items[i];
        return null;
    }
    selectedValue() {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].isSelected())
                return this.items[i].value;
        return null;
    }
    setSelectedItem(item) {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
    }
    setSelectedValue(model) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.value == model)
                item.select();
            else
                item.unSelect();
        }
    }
    onRowClick(item) {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
    }
    htmlTemplate() {
        return `
<table id="fsDataGrid" class="table table-hover table-bordered table-sm">
  <thead id="gridHeader">
  </thead>
  <tbody id="gridBody" style="overflow-y:scrol; height: 100px">
  </tbody>
</table>        
`;
    }
    onWidgetDidLoad() {
        this.table = this.elementById('fsDataGrid');
        this.table.style.background = 'white';
        this.tableHeader = this.elementById('gridHeader');
        this.tableBody = this.elementById('gridBody');
    }
    setCustomPresenter(presenter) {
        presenter.render(this);
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        this.table.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
//exports.UIDataGrid = UIDataGrid;
