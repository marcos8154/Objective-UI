"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UITextArea = //exports.UITextAreaBinder = void 0;
class UITextAreaBinder extends WidgetBinder {
    constructor(textBox) {
        super(textBox);
        this.textBox = this.widget;
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.textBox.setText(`${value}`);
    }
    fillPropertyModel() {
        var text = this.textBox.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue() {
        var text = this.textBox.getText();
        return text;
    }
}
//exports.UITextAreaBinder = UITextAreaBinder;
class UITextArea extends Widget {
    constructor({ name, title = '', height = '100px', maxlength = 255, text = '' }) {
        super(name);
        this.initialTitle = null;
        this.initialText = null;
        this.initialMaxlength = null;
        this.initialHeight = null;
        this.lbTitle = null;
        this.txInput = null;
        this.divContainer = null;
        this.initialHeight = (Misc.isNull(height) ? '100px' : height);
        this.initialTitle = (Misc.isNullOrEmpty(title) ? '' : title);
        this.initialText = (Misc.isNullOrEmpty(text) ? '' : text);
        this.initialMaxlength = (Misc.isNullOrEmpty(maxlength) ? 100 : maxlength);
    }
    htmlTemplate() {
        return `
<div id="divContainer" class="form-group">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <textarea id="entryInput" class="form-control form-control-sm"> </textarea>
</div>`;
    }
    setEnabled(enabled) {
        this.txInput.disabled = (enabled == false);
    }
    getBinder() {
        return new UITextAreaBinder(this);
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    onWidgetDidLoad() {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('divContainer');
        this.lbTitle.innerText = this.initialTitle;
        this.txInput.value = this.initialText;
        this.txInput.style.height = this.initialHeight;
        this.setMaxLength(this.initialMaxlength);
    }
    setMaxLength(maxlength) {
        this.txInput.maxLength = maxlength;
    }
    removeLabel() {
        this.lbTitle.remove();
    }
    setPlaceholder(text) {
        this.txInput.placeholder = text;
    }
    getText() {
        return this.value();
    }
    setText(newText) {
        this.txInput.value = (Misc.isNullOrEmpty(newText) ? '' : newText);
    }
    setTitle(newTitle) {
        this.lbTitle.textContent = newTitle;
    }
    value() {
        return this.txInput.value;
    }
    addCSSClass(className) {
        this.txInput.classList.add(className);
    }
    removeCSSClass(className) {
        this.txInput.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.txInput.style.setProperty(propertyName, propertyValue);
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
//exports.UITextArea = UITextArea;
