"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UITextBox = //exports.UITextBoxBinder = //exports.Mask = void 0;
class Mask {
    static array() {
        return [
            this.DATE,
            this.TIME,
            this.DATE_TIME,
            this.CEP,
            this.PHONE,
            this.PHONE_DDD,
            this.PHONE_US,
            this.CPF,
            this.CNPJ,
            this.MONEY,
            this.MONEY2,
            this.IP_ADDRESS,
            this.PERCENT
        ];
    }
}
//exports.Mask = Mask;
/** 00/00/0000 */
Mask.DATE = '00/00/0000';
/**00:00:00 */
Mask.TIME = '00:00:00';
/**00/00/0000 00:00:00 */
Mask.DATE_TIME = '00/00/0000 00:00:00';
/**00000-000 */
Mask.CEP = '00000-000';
/**0000-0000 */
Mask.PHONE = '0000-0000';
/** (00) 0000-0000*/
Mask.PHONE_DDD = '(00) 0000-0000';
/**(000) 000-0000 */
Mask.PHONE_US = '(000) 000-0000';
/**000.000.000-00 */
Mask.CPF = '000.000.000-00';
/**00.000.000/0000-00 */
Mask.CNPJ = '00.000.000/0000-00';
/**000.000.000.000.000,00 */
Mask.MONEY = '000.000.000.000.000,00';
/**#.##0,00 */
Mask.MONEY2 = '#.##0,00';
/**099.099.099.099 */
Mask.IP_ADDRESS = '099.099.099.099';
/**##0,00% */
Mask.PERCENT = '##0,00%';
class UITextBoxBinder extends WidgetBinder {
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
//exports.UITextBoxBinder = UITextBoxBinder;
class UITextBox extends Widget {
    constructor({ name, type = 'text', title = '', maxlength = 100, placeHolder = '', text = '', mask = '', containerClass = 'form-group' }) {
        super(name);
        this.initialTitle = null;
        this.initialPlaceHolder = null;
        this.initialText = null;
        this.initialType = null;
        this.initialMaxlength = null;
        this.initialMask = null;
        this.containerClass = null;
        this.lbTitle = null;
        this.txInput = null;
        this.divContainer = null;
        this.initialType = (Misc.isNullOrEmpty(type) ? 'text' : type);
        this.initialTitle = (Misc.isNullOrEmpty(title) ? '' : title);
        this.initialPlaceHolder = (Misc.isNullOrEmpty(placeHolder) ? '' : placeHolder);
        this.initialText = (Misc.isNullOrEmpty(text) ? '' : text);
        this.initialMaxlength = (Misc.isNullOrEmpty(maxlength) ? 100 : maxlength);
        this.initialMask = (Misc.isNull(mask) ? '' : mask);
        this.containerClass = (Misc.isNull(containerClass) ? 'form-group' : containerClass);
    }
    htmlTemplate() {
        return `
<div id="divContainer" class="${this.containerClass}">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <input id="entryInput" class="form-control form-control-sm"  placeholder="Entry placeholder">
</div>`;
    }
    setEnabled(enabled) {
        this.txInput.disabled = (enabled == false);
    }
    getBinder() {
        return new UITextBoxBinder(this);
    }
    applyMask(maskPattern) {
        if (Misc.isNullOrEmpty(maskPattern))
            return;
        //making jQuery call
        var jQueryCall = `$('#${this.txInput.id}').mask('${maskPattern}'`;
        var a = Mask.array();
        var hasReverseFields = ((a.indexOf(Mask.CPF) +
            a.indexOf(Mask.CNPJ) +
            a.indexOf(Mask.MONEY) +
            a.indexOf(Mask.MONEY2)) >= 0);
        if (hasReverseFields)
            jQueryCall += ', {reverse: true});';
        else
            jQueryCall += ');';
        jQueryCall = `try { ${jQueryCall} } catch { }`;
        var maskFunction = new VirtualFunction({
            fnName: 'enableMask',
            fnContent: jQueryCall
        });
        maskFunction.call();
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    setInputType(inputType) {
        this.txInput.type = inputType;
    }
    onWidgetDidLoad() {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('divContainer');
        this.lbTitle.innerText = this.initialTitle;
        this.txInput.placeholder = this.initialPlaceHolder;
        this.txInput.value = this.initialText;
        this.setMaxLength(this.initialMaxlength);
        this.setInputType(this.initialType);
        this.applyMask(this.initialMask);
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
//exports.UITextBox = UITextBox;
