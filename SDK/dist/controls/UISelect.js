"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UISelect = //exports.UISelectBinder = void 0;
class UISelectBinder extends WidgetBinder {
    constructor(select) {
        super(select);
        this.select = select;
    }
    getWidgetValue() {
        return this.select.value();
    }
    refreshUI() {
        var models = this.getModelPropertyValue();
        if (this.bindingHasPath)
            this.select.fromList(models, this.valueProperty, this.displayProperty);
        else
            this.select.fromList(models);
    }
    fillPropertyModel() { }
}
//exports.UISelectBinder = UISelectBinder;
class UISelect extends Widget {
    constructor({ name, title }) {
        super(name);
        this.divContainer = null;
        this.title = null;
        this.select = null;
        this.onSelectionChanged = null;
        this.initialTitle = null;
        this.itemsSource = [];
        this.initialTitle = title;
    }
    htmlTemplate() {
        return `
<div id="fsSelect" class="form-group">
    <label id="selectTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="selectEl"> Select Title </label>
    <select style="height: 35px" id="selectEl" class="form-control">
    </select>
</div>`;
    }
    getBinder() {
        return new UISelectBinder(this);
        ;
    }
    onWidgetDidLoad() {
        var self = this;
        this.divContainer = this.elementById('fsSelect');
        this.title = this.elementById('selectTitle');
        this.select = this.elementById('selectEl');
        this.select.onchange = function (ev) {
            if (self.onSelectionChanged != null)
                self.onSelectionChanged(ev);
        };
        this.title.textContent = this.initialTitle;
    }
    setSelectedOption(optionValue) {
        try {
            for (var i = 0; i < this.select.options.length; i++)
                this.select.options[i].selected = false;
            for (var i = 0; i < this.select.options.length; i++) {
                var option = this.select.options[i];
                if (option.value == optionValue) {
                    option.selected = true;
                    return;
                }
            }
        }
        catch (error) {
            this.processError(error);
        }
    }
    fromList(models, valueProperty, displayProperty) {
        if (models == null || models == undefined)
            return;
        try {
            this.valueProperty = valueProperty;
            this.displayProperty = displayProperty;
            this.itemsSource = models;
            var optionsFromModels = [];
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                var option = null;
                if (valueProperty != null && valueProperty != undefined)
                    option = new SelectOption(model[valueProperty], model[displayProperty]);
                else
                    option = new SelectOption(`${models[i]}`, `${models[i]}`);
                optionsFromModels.push(option);
            }
            this.addOptions(optionsFromModels);
        }
        catch (error) {
            this.processError(error);
        }
    }
    addOptions(options) {
        this.select.innerHTML = '';
        for (var i = 0; i < options.length; i++)
            this.addOption(options[i]);
    }
    addOption(option) {
        try {
            var optionEL = document.createElement('option');
            optionEL.value = option.value;
            optionEL.textContent = option.text;
            this.select.add(optionEL);
            return this;
        }
        catch (error) {
            this.processError(error);
        }
    }
    setTitle(title) {
        this.title.textContent = title;
    }
    setCustomPresenter(renderer) {
        try {
            renderer.render(this);
        }
        catch (error) {
            this.processError(error);
        }
    }
    /**
     * Gets the selected object-value item
     * Its works only when uses 'fromList(...)' UISelect function
     * @returns T
     */
    getSelectedItem() {
        var val = this.value(); //key value of object-item
        for (var i = 0; i < this.itemsSource.length; i++) {
            var itemObj = this.itemsSource[i];
            if (itemObj[this.valueProperty] == val)
                return itemObj;
        }
        return null;
    }
    value() {
        return this.select.value;
    }
    addCSSClass(className) {
        this.select.classList.add(className);
    }
    removeCSSClass(className) {
        this.select.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.select.style.setProperty(propertyName, propertyValue);
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
    setEnabled(enabled) {
        this.select.disabled = (enabled == false);
    }
}
//exports.UISelect = UISelect;
