"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIList = //exports.UIListBinder = void 0;
class UIListBinder extends WidgetBinder {
    constructor(listView) {
        super(listView);
        this.listView = listView;
    }
    refreshUI() {
        var viewModels = this.getModelPropertyValue();
        this.listView.fromList(viewModels, this.valueProperty, this.displayProperty);
    }
    getWidgetValue() {
        var item = this.listView.selectedItem();
        if (item == null)
            return null;
        return item.value;
    }
    fillPropertyModel() { }
}
//exports.UIListBinder = UIListBinder;
class UIList extends Widget {
    /**
     *
     * @param itemClicked Function to handle onClick item event.
     *
     * Parameters: **(item: IListItemTemplate, ev: Event)**
     */
    constructor({ name, itemClicked = null, templateProvider = null }) {
        super(name);
        this.items = [];
        this.customBehaviorColors = false;
        this.unSelectedBackColor = null;
        this.unSelectedForeColor = null;
        this.selectedBackColor = null;
        this.selectedForeColor = null;
        this.templateProvider = templateProvider;
        this.itemClickedCallback = itemClicked;
    }
    htmlTemplate() {
        return `
<div id="fsListView" class="list-group">
</div>`;
    }
    setTemplateProvider(itemTemplateProvider) {
        this.templateProvider = itemTemplateProvider;
    }
    /**
     * Changes the color selection behavior for each UIList item.
     *
     * NOTE: not every implementation of 'IListItemTemplate'
     * will be able to obey this
     */
    changeColors(selectedBack, selectedFore, unSelectedBack, unSelectedFore) {
        this.customBehaviorColors = true;
        this.selectedBackColor = selectedBack;
        this.selectedForeColor = selectedFore;
        this.unSelectedBackColor = unSelectedBack;
        this.unSelectedForeColor = unSelectedFore;
    }
    itemTemplateProvider() {
        return this.templateProvider;
    }
    getBinder() {
        return new UIListBinder(this);
    }
    fromList(viewModels, valueProperty, displayProperty) {
        this.divContainer.innerHTML = '';
        if (viewModels == null || viewModels == undefined || viewModels.length == 0) {
            try {
                var templateProvider = this.itemTemplateProvider();
                if (templateProvider != null) {
                    var customItem = templateProvider.getListItemTemplate(this, null);
                    if (customItem != null && customItem != undefined)
                        this.addItem(customItem);
                }
            }
            catch (err) {
                console.error(err);
            }
            return;
        }
        ;
        for (var i = 0; i < viewModels.length; i++) {
            var viewModel = viewModels[i];
            var text = (displayProperty == null ? `${viewModel}` : viewModel[displayProperty]);
            var value = (valueProperty == null ? `${viewModel}` : viewModel[valueProperty]);
            if (this.itemTemplateProvider() == null) {
                var defaultItemTemplate = new ListItem(`${i + 1}`, text, value);
                this.addItem(defaultItemTemplate);
            }
            else {
                var templateProvider = this.itemTemplateProvider();
                var customItem = templateProvider.getListItemTemplate(this, viewModel);
                this.addItem(customItem);
            }
        }
    }
    onWidgetDidLoad() {
        this.divContainer = this.elementById('fsListView');
    }
    onItemClicked(item, ev) {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
        if (this.itemClickedCallback != null && this.itemClickedCallback != undefined)
            this.itemClickedCallback(item, ev);
    }
    addItem(item) {
        item.setOwnerList(this);
        this.items.push(item);
        var view = item.itemTemplate();
        var self = this;
        view.onclick = function (ev) {
            self.onItemClicked(item, ev);
        };
        this.divContainer.append(view);
        return this;
    }
    removeItem(item) {
        for (var i = 0; i < this.divContainer.children.length; i++) {
            var view = this.divContainer.children[i];
            if (view.id == item.itemName) {
                var indx = this.items.indexOf(item);
                if (indx >= 0)
                    this.items.splice(indx, 1);
                this.divContainer.removeChild(view);
                item = null;
                return;
            }
        }
    }
    setSelectedValue(itemValue) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.value == itemValue)
                item.select();
            else
                item.unSelect();
        }
    }
    setSelectedItem(selectedItem) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            item.unSelect();
        }
        selectedItem.select();
    }
    selectedItem() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.isSelected())
                return item;
        }
        return null;
    }
    selectedValue() {
        var sItem = this.selectedItem();
        if (sItem == null || sItem == undefined)
            return null;
        return sItem.value;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return this.selectedValue();
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.divContainer.classList.add(className);
    }
    removeCSSClass(className) {
        this.divContainer.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.divContainer.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    setVisible(visible) {
        this.divContainer.hidden = (visible == false);
    }
}
//exports.UIList = UIList;
