import { FSWidget } from "../FSWidget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";

export class FSCheckBoxBinder extends WidgetBinder
{
    private checkBox: FSCheckBox;
    constructor(checkBox: FSCheckBox)
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

export class FSCheckBox extends FSWidget implements IBindable
{
    public divContainer: HTMLDivElement;
    public checkElement: HTMLInputElement;
    public checkLabel: HTMLLabelElement;
    public onCheckedChange: Function;


    private labelText: string;
    constructor({name, text }:
        { name: string; text: string; })
    {
        super(name);

        this.labelText = text;
    }
    getBinder(): WidgetBinder
    {
        return new FSCheckBoxBinder(this);
    }

    protected htmlTemplate(): string
    {
        return `
<div id="fsCheckBox" class="custom-control custom-checkbox">
  <input id="checkElement" class="custom-control-input" type="checkbox" value="">
  <label id="checkLabel" class="custom-control-label font-weight-normal" for="checkElement">
    Default checkbox
  </label>
</div>`
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;
        self.divContainer = self.elementById('fsCheckBox');
        self.checkElement = self.elementById('checkElement');
        self.checkLabel = self.elementById('checkLabel');
        self.checkLabel.htmlFor = self.checkElement.id;
        self.checkLabel.textContent = self.labelText;

        self.checkElement.onchange = function(ev)
        {
            if(self.onCheckedChange != null) self.onCheckedChange({checked: self.checkElement.checked, event: ev});
        };
    }

    public setText(text:string): void
    {
        this.labelText = text;
        this.checkLabel.textContent = this.labelText;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
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
       this.divContainer.hidden = (visible == false);
    }
    
    public setChecked(isChecked: boolean): void
    {
        this.checkElement.checked = isChecked;
    }
    public isChecked(): boolean
    {
        return this.checkElement.checked;
    }
}