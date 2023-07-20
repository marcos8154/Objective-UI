"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UISpinner = void 0;
class UISpinner extends Widget {
    constructor({ name, colorClass = 'text-primary', visible = true }) {
        super(name);
        this.containerDiv = null;
        this.spanSpinner = null;
        this.colorCls = (Misc.isNullOrEmpty(colorClass) ? 'text-primary' : colorClass);
        this.initialVisible = (Misc.isNull(visible) ? true : visible);
    }
    onWidgetDidLoad() {
        this.containerDiv = this.elementById('container');
        this.spanSpinner = this.elementById('spnSpinner');
        this.setVisible(this.initialVisible);
    }
    htmlTemplate() {
        var colorClass = this.colorCls;
        if (colorClass == 'primary')
            colorClass = 'text-primary';
        if (colorClass == '')
            colorClass = 'text-primary';
        return `
<div id="container" class="spinner-border ${colorClass}" role="status">
    <span id="spnSpinner" class="sr-only"/>
</div>
        `;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return null;
    }
    setEnabled(enabled) {
    }
    addCSSClass(className) {
        this.spanSpinner.classList.remove(className);
    }
    removeCSSClass(className) {
        this.spanSpinner.classList.add(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.spanSpinner.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
    }
    setVisible(visible) {
        this.containerDiv.hidden = (visible == false);
    }
}
//exports.UISpinner = UISpinner;
