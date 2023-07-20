"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIHead = //exports.UIHeadBinder = void 0;
class UIHeadBinder extends WidgetBinder {
    constructor(head) {
        super(head);
        this.head = head;
    }
    getWidgetValue() {
        return this.head.value();
    }
    refreshUI() {
        var propValue = this.getModelPropertyValue();
        this.head.setText(`${propValue}`);
    }
    fillPropertyModel() { }
}
//exports.UIHeadBinder = UIHeadBinder;
class UIHead extends Widget {
    constructor({ name, headType, text }) {
        super(name);
        if (headType == '' || headType == null || headType == undefined)
            headType = 'H1';
        this.textContent = text;
        this.headType = headType
            .replace('<', '')
            .replace('/', '')
            .replace('>', '');
    }
    getBinder() {
        return new UIHeadBinder(this);
    }
    htmlTemplate() {
        return `<${this.headType} id="fsHead"> </${this.headType}>`;
    }
    onWidgetDidLoad() {
        this.headElement = this.elementById('fsHead');
        this.headElement.textContent = this.textContent;
    }
    setCustomPresenter(presenter) {
        presenter.render(this);
    }
    setText(text) {
        this.headElement.textContent = text;
    }
    value() {
        return this.headElement.textContent;
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.headElement.classList.add(className);
    }
    removeCSSClass(className) {
        this.headElement.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.headElement.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.headElement.style.position = position;
        this.headElement.style.left = marginLeft;
        this.headElement.style.top = marginTop;
        this.headElement.style.right = `${marginRight}`;
        this.headElement.style.bottom = `${marginBottom}`;
        this.headElement.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.headElement.hidden = (visible == false);
    }
}
//exports.UIHead = UIHead;
