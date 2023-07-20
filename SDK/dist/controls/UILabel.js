"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UILabel = //exports.UILabelBinder = void 0;
class UILabelBinder extends WidgetBinder {
    constructor(label) {
        super(label);
        this.label = label;
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.label.setText(`${value}`);
    }
    fillPropertyModel() {
        var text = this.label.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue() {
        var text = this.label.getText();
        return text;
    }
}
//exports.UILabelBinder = UILabelBinder;
class UILabel extends Widget {
    constructor({ name, text }) {
        super(name);
        this.lblText = text;
    }
    htmlTemplate() {
        return `<label id="uiLabel" class="label"> Default label </label>`;
    }
    onWidgetDidLoad() {
        this.label = this.elementById('uiLabel');
        this.label.textContent = this.lblText;
    }
    setText(text) {
        this.label.textContent = text;
    }
    getText() {
        return this.value();
    }
    getBinder() {
        return new UILabelBinder(this);
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return `${this.label.textContent}`;
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.label.classList.add(className);
    }
    removeCSSClass(className) {
        this.label.classList.add(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.label.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.label.style.position = position;
        this.label.style.left = marginLeft;
        this.label.style.top = marginTop;
        this.label.style.right = marginRight;
        this.label.style.bottom = marginBottom;
        this.label.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.label.hidden = (visible == false);
    }
}
//exports.UILabel = UILabel;
