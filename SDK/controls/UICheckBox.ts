import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";
import { Misc } from "../Misc";
import { PageShell } from "../PageShell";

export class UICheckBoxBinder extends WidgetBinder
{
    private checkBox: UICheckBox;
    constructor(checkBox: UICheckBox)
    {
        super(checkBox);
        this.checkBox = checkBox;
    }

    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.checkBox.setChecked(value);
    }
    fillPropertyModel(): void
    {
        var checked: boolean = this.checkBox.isChecked();
        this.setModelPropertyValue(checked);
    }
    getWidgetValue()
    {
        var checked: boolean = this.checkBox.isChecked();
        return checked;
    }
}

export class UICheckBox extends Widget implements IBindable
{
    public divContainer: HTMLDivElement;
    public checkElement: HTMLInputElement;
    public checkLabel: HTMLLabelElement;
    public onCheckedChange: Function;

    private initialChecked: boolean;
    private labelText: string;
    private customBaseTemplate: string;

    /**
     * 
     * @param fnOnChange 
     * ```
     * (checked: boolean, checkBox: UICheckBox) => {  }
     * ```
     */
    constructor({ name, text, checked = false, customTemplate = null, onCheckedChanceFn = null }:
        {
            name: string;
            text: string;
            checked?: boolean;
            customTemplate?: string,
            onCheckedChanceFn?: Function
        })
    {
        super(name);

        this.labelText = text;
        this.initialChecked = checked;
        this.customBaseTemplate = customTemplate;
        this.onCheckedChange = onCheckedChanceFn;
    }
    getBinder(): WidgetBinder
    {
        return new UICheckBoxBinder(this);
    }

    protected htmlTemplate(): string
    {
        if (!Misc.isNullOrEmpty(this.customBaseTemplate))
        {
            if (this.customBaseTemplate.indexOf('UICheckBox') == -1)
                throw new Error(`UICheckBox '${this.widgetName}' failed to load: custom base-template does not contains an <div/> with Id="UICheckBox".`)
            if (this.customBaseTemplate.indexOf('checkElement') == -1)
                throw new Error(`UICheckBox '${this.widgetName}' failed to load: custom base-template does not contains an <input/> with Id="checkElement".`)
            if (this.customBaseTemplate.indexOf('checkLabel') == -1)
                throw new Error(`UICheckBox '${this.widgetName}' failed to load: custom base-template does not contains an <label/> with Id="checkLabel".`)

            return this.customBaseTemplate;
        }

        if (PageShell.BOOTSTRAP_VERSION_NUMBER > 4.9)
            throw new Error(`UICheckBox: this Widget does dot supports Bootstrap's v${PageShell.BOOTSTRAP_VERSION}; For use with v5.x, you should use 'UICheckBoxBS5' class. `)
        return `
<div id="UICheckBox" class="custom-control custom-checkbox">
  <input id="checkElement" class="custom-control-input" type="checkbox" value="">
  <label id="checkLabel" class="custom-control-label font-weight-normal" for="checkElement">
    Default checkbox
  </label>
</div>`
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;
        self.divContainer = self.elementById('UICheckBox');
        self.checkElement = self.elementById('checkElement');
        self.checkLabel = self.elementById('checkLabel');
        self.checkLabel.htmlFor = self.checkElement.id;
        self.checkLabel.textContent = self.labelText;
        self.checkElement.checked = self.initialChecked;

        self.checkElement.onchange = function (ev)
        {
            if (self.onCheckedChange != null) self.onCheckedChange({ checked: self.checkElement.checked, checkBox: self });
        };
    }


    /**
     * 
     * @param fnOnChange 
     * ```
     * (checked: boolean, checkBox: UICheckBox) => {  }
     * ```
     */
    public setOnCheckChange(fnOnChange: Function)
    {
        const $ = this;
        this.onCheckedChange = fnOnChange
        this.checkElement.onchange = () =>
        {
            if (!Misc.isNull($.onCheckedChange))
                $.onCheckedChange($.value(), $)
        }
    }

    public setText(text: string): void
    {
        this.labelText = text;
        this.checkLabel.textContent = this.labelText;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return this.checkElement.checked.toString();
    }
    public setEnabled(enabled: boolean): void
    {
        this.checkElement.disabled = (enabled == false);
    }
    public addCSSClass(className: string): void
    {
        this.checkElement.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.checkElement.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.checkElement.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string,
        marginLeft: string,
        marginTop: string,
        marginRight: string,
        marginBottom: string,
        transform?: string): void
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = `${transform}`;
    }

    public setVisible(visible: boolean): void
    {
        this.divContainer.style.visibility = (visible ? 'visible' : 'hidden');
    }

    public setChecked(isChecked: boolean): void
    {
        this.checkElement.checked = isChecked;
        if (!Misc.isNull(this.onCheckedChange))
            this.onCheckedChange(isChecked, this)
    }
    public isChecked(): boolean
    {
        return this.checkElement.checked;
    }
}