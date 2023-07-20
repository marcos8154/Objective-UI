"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UICheckBox = //exports.UICheckBoxBinder = void 0;
class UICheckBoxBinder extends WidgetBinder {
    constructor(checkBox) {
        super(checkBox);
        this.checkBox = checkBox;
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.checkBox.setChecked(value);
    }
    fillPropertyModel() {
        var checked = this.checkBox.isChecked();
        this.setModelPropertyValue(checked);
    }
    getWidgetValue() {
        var checked = this.checkBox.isChecked();
        return checked;
    }
}
//exports.UICheckBoxBinder = UICheckBoxBinder;
class UICheckBox extends Widget {
    constructor({ name, text, checked = false }) {
        super(name);
        this.labelText = text;
        this.initialChecked = checked;
    }
    getBinder() {
        return new UICheckBoxBinder(this);
    }
    htmlTemplate() {
        return `
<div id="fsCheckBox" class="custom-control custom-checkbox">
  <input id="checkElement" class="custom-control-input" type="checkbox" value="">
  <label id="checkLabel" class="custom-control-label font-weight-normal" for="checkElement">
    Default checkbox
  </label>
</div>`;
    }
    onWidgetDidLoad() {
        var self = this;
        self.divContainer = self.elementById('fsCheckBox');
        self.checkElement = self.elementById('checkElement');
        self.checkLabel = self.elementById('checkLabel');
        self.checkLabel.htmlFor = self.checkElement.id;
        self.checkLabel.textContent = self.labelText;
        self.checkElement.checked = self.initialChecked;
        self.checkElement.onchange = function (ev) {
            if (self.onCheckedChange != null)
                self.onCheckedChange({ checked: self.checkElement.checked, event: ev });
        };
    }
    setText(text) {
        this.labelText = text;
        this.checkLabel.textContent = this.labelText;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return this.checkElement.checked.toString();
    }
    setEnabled(enabled) {
        this.checkElement.disabled = (enabled == false);
    }
    addCSSClass(className) {
        this.checkElement.classList.add(className);
    }
    removeCSSClass(className) {
        this.checkElement.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.checkElement.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.divContainer.hidden = (visible == false);
    }
    setChecked(isChecked) {
        this.checkElement.checked = isChecked;
    }
    isChecked() {
        return this.checkElement.checked;
    }
}
//exports.UICheckBox = UICheckBox;
