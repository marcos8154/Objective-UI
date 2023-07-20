"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIRadioGroup = //exports.UIRadioGroupBinder = //exports.RadioOption = void 0;
class RadioOption {
    constructor(text, value, fieldSetId, shell, ownerGroup) {
        var template = new UITemplateView(`
<div id="radioOptionContainer" style="margin-right: 10px" class="custom-control custom-radio">
    <input id="radioInput" type="radio" name="fieldset" class="custom-control-input">
    <label id="radioLabel" class="custom-control-label font-weight-normal" for=""> Radio Option </label>
</div>
`, shell);
        this.ownerGroup = ownerGroup;
        this.optionContainer = template.elementById('radioOptionContainer');
        this.radioInput = template.elementById('radioInput');
        this.radioLabel = template.elementById('radioLabel');
        this.radioLabel.textContent = text;
        this.radioInput.value = value;
        this.radioInput.name = fieldSetId;
        this.radioLabel.htmlFor = this.radioInput.id;
        var self = this;
        this.radioInput.onclick = function (ev) {
            ownerGroup.optionChanged(self);
        };
    }
    isChecked() {
        return this.radioInput.checked;
    }
    value() {
        return this.radioInput.value;
    }
    setChecked(isChecked) {
        if (isChecked)
            this.ownerGroup.optionChanged(this);
        this.radioInput.checked = isChecked;
    }
    setEnabled(isEnabled) {
        this.radioInput.disabled = (isEnabled == false);
    }
}
//exports.RadioOption = RadioOption;
class UIRadioGroupBinder extends WidgetBinder {
    constructor(radioGroup) {
        super(radioGroup);
        this.radioGp = radioGroup;
    }
    getWidgetValue() {
        return this.radioGp.value();
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.radioGp.setValue(value);
    }
    fillPropertyModel() {
        var value = this.getWidgetValue();
        this.setModelPropertyValue(value);
    }
}
//exports.UIRadioGroupBinder = UIRadioGroupBinder;
class UIRadioGroup extends Widget {
    /**
    *
    * @param direction Flex direction: 'column' / 'row'
    * @param options array { t:'Option Text', v: 'option_value' }
    */
    constructor({ name, title = '', orientation = 'vertical', options = [], onChange = null }) {
        super(name);
        this.options = [];
        this.initialOptions = [];
        this.title = title;
        this.orientation = orientation;
        this.initialOptions = options;
        this.onChangeFn = onChange;
    }
    getBinder() {
        return new UIRadioGroupBinder(this);
    }
    optionChanged(currentOp) {
        if (Misc.isNull(this.onChangeFn) == false)
            this.onChangeFn(currentOp, this);
    }
    setOnChangedEvent(fn) {
        this.onChangeFn = fn;
    }
    onWidgetDidLoad() {
        this.groupContainer = this.elementById('fsRadioGroup');
        this.groupTitle = this.elementById('groupTitle');
        this.fieldSet = this.elementById('fieldSet');
        this.groupTitle.textContent = this.title;
        if (this.orientation != 'horizontal' && this.orientation != 'vertical')
            throw new Error(`Invalid value '${orientation}' for 'orientation' parmeter. Accepted values are 'vertical' or 'horizontal'`);
        if (this.orientation == 'vertical')
            this.fieldSet.classList.add(`flex-column`);
        if (this.orientation == 'horizontal')
            this.fieldSet.classList.add(`flex-row`);
        this.addOptions(this.initialOptions);
    }
    htmlTemplate() {
        return `
<div id="fsRadioGroup">
  <label id="groupTitle" class="font-weight-normal" style="margin-left: 3px"> </label>
  <fieldset class="d-flex" id="fieldSet">
  </fieldset>
</div>`;
    }
    /**
     *
     * @param options  array { t:'Option Text', v: 'option_value' }
     */
    addOptions(options) {
        for (var i = 0; i < options.length; i++) {
            var op = options[i];
            this.addOption(op.t, op.v);
        }
    }
    addOption(text, value) {
        var newOpt = new RadioOption(text, value, this.fieldSet.id, this.getPageShell(), this);
        this.options.push(newOpt);
        this.fieldSet.appendChild(newOpt.optionContainer);
    }
    fromList(models, textKey, valueKey) {
        for (var i = 0; i < models.length; i++) {
            var model = models[i];
            var text = model[textKey];
            var value = model[valueKey];
            this.addOption(text, value);
        }
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    selectedOption() {
        for (var i = 0; i < this.options.length; i++)
            if (this.options[i].isChecked())
                return this.options[i];
    }
    setValue(value) {
        for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].value() == value)
                this.options[i].setChecked(true);
            else
                this.options[i].setChecked(false);
        }
    }
    value() {
        for (var i = 0; i < this.options.length; i++) {
            var op = this.options[i];
            if (op.isChecked())
                return op.value();
        }
        return '';
    }
    setEnabled(enabled) {
        for (var i = 0; i < this.options.length; i++) {
            var op = this.options[i];
            op.setEnabled(enabled);
        }
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.groupContainer.style.position = position;
        this.groupContainer.style.left = marginLeft;
        this.groupContainer.style.top = marginTop;
        this.groupContainer.style.right = marginRight;
        this.groupContainer.style.bottom = marginBottom;
        this.groupContainer.style.transform = transform;
    }
    setVisible(visible) {
        this.groupContainer.hidden = (visible == false);
    }
}
//exports.UIRadioGroup = UIRadioGroup;
