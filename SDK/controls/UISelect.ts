import { DefaultExceptionPage } from "../DefaultExceptionPage";
import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { SelectOption } from "../SelectOption";
import { WidgetBinder } from "../WidgetBinder";
import { UIListBinder } from "./UIList";

export class UISelectBinder extends WidgetBinder
{
    private select: UISelect;
    constructor(select: UISelect)
    {
        super(select);
        this.select = select;
    }
    getWidgetValue()
    {
        return this.select.value();
    }
    refreshUI(): void
    {
        var models: Array<any | object> = this.getModelPropertyValue();
        if (this.bindingHasPath)
            this.select.fromList(models, this.valueProperty, this.displayProperty);
        else
            this.select.fromList(models);
    }
    fillPropertyModel(): void { }
}

export class UISelect extends Widget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="fsSelect" class="form-group">
    <label id="selectTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="selectEl"> Select Title </label>
    <select style="height: 35px" id="selectEl" class="form-control">
    </select>
</div>`
    }

    private divContainer: HTMLDivElement = null;
    private title: HTMLLabelElement = null;
    private select: HTMLSelectElement = null;
    public onSelectionChanged: Function = null;
    private initialTitle: string = null;

    constructor({ name, title }:
        {
            name: string,
            title: string
        })
    {
        super(name);
        this.initialTitle = title;
    }
    getBinder(): WidgetBinder
    {
        return new UISelectBinder(this);;
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;

        this.divContainer = this.elementById('fsSelect');
        this.title = this.elementById('selectTitle');
        this.select = this.elementById('selectEl');

        this.select.onchange = function (ev)
        {
            if (self.onSelectionChanged != null)
                self.onSelectionChanged(ev);
        };
        this.title.textContent = this.initialTitle;

    }
    public setSelectedOption(optionValue: any): void
    {
        try
        {
            for (var i = 0; i < this.select.options.length; i++)
                this.select.options[i].selected = false;

            for (var i = 0; i < this.select.options.length; i++)
            {
                var option = this.select.options[i];

                if (option.value == optionValue)
                {
                    option.selected = true;
                    return;
                }
            }
        } catch (error)
        {
            this.processError(error);
        }
    }

    public fromList(models: Array<any>,
        valueProperty?: string,
        displayProperty?: string): void
    {
        if (models == null || models == undefined) return;
        try
        {
            var optionsFromModels: Array<SelectOption> = [];
            for (var i = 0; i < models.length; i++)
            {
                var model = models[i];
                var option: SelectOption = null;

                if (valueProperty != null && valueProperty != undefined)
                    option = new SelectOption(model[valueProperty], model[displayProperty])
                else
                    option = new SelectOption(`${models[i]}`, `${models[i]}`);

                optionsFromModels.push(option);
            }
            this.addOptions(optionsFromModels);
        }
        catch (error)
        {
            this.processError(error);
        }
    }

    public addOptions(options: Array<SelectOption>): void
    {
        this.select.innerHTML = '';
        for (var i = 0; i < options.length; i++)
            this.addOption(options[i]);
    }

    public addOption(option: SelectOption): UISelect
    {
        try
        {
            var optionEL: HTMLOptionElement = document.createElement('option');
            optionEL.value = option.value;
            optionEL.textContent = option.text;
            this.select.add(optionEL);
            return this;
        }
        catch (error)
        {
            this.processError(error);
        }
    }

    public setTitle(title: string): void
    {
        this.title.textContent = title;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        try
        {
            renderer.render(this);
        }
        catch (error)
        {
            this.processError(error);
        }
    }

    public value(): string
    {
        return this.select.value;
    }
    public addCSSClass(className: string): void
    {
        this.select.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.select.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.select.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.divContainer.hidden = (visible == false);
    }

    public setEnabled(enabled: boolean): void
    {
        this.select.disabled = (enabled == false);
    }
}