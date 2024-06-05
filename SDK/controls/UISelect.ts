import { DefaultExceptionPage } from "../DefaultExceptionPage";
import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { SelectOption } from "../SelectOption";
import { WidgetBinder } from "../WidgetBinder";
import { UIListBinder } from "./UIList";
import { Misc } from "../Misc";

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

        if (this.isTargetDefined())
        {
            var value = this.getModelTargetPropertyValue();
            this.select.setSelectedOption(value);
        }
    }
    fillPropertyModel(): void
    {
        if (this.isTargetDefined())
        {
            this.fillModelTargetPropertyValue();
        }
    }
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

    public divContainer: HTMLDivElement = null;
    public title: HTMLLabelElement = null;
    public select: HTMLSelectElement = null;

    public onSelectionChanged: Function = null;
    private initialTitle: string = null;

    private containerClass: string = null;

    /**
     * 
     * @param onChangeFn 
     * ```
     * (value: any, select: UISelect) => { } 
     * ```
    */
    constructor({ name, title, containerClass, selectionChangeFn }:
        {
            name: string,
            title: string,
            containerClass?: string,
            selectionChangeFn?: Function
        })
    {
        super(name);
        this.initialTitle = title;
        this.containerClass = containerClass;
        this.onSelectionChanged = selectionChangeFn;
    }
    getBinder(): WidgetBinder
    {
        return new UISelectBinder(this);
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;

        this.divContainer = this.elementById('fsSelect');
        this.title = this.elementById('selectTitle');
        this.select = this.elementById('selectEl');

        if (!Misc.isNull(this.containerClass))
        {
            var classes = this.containerClass.split(' ');
            for (var c = 0; c < classes.length; c++)
                this.divContainer.classList.add(classes[c]);
        }

        const $ = this
        this.select.onchange = function (ev)
        {
            if (!Misc.isNull($.onSelectionChanged))
                $.onSelectionChanged($.value(), $)
        };
        this.title.textContent = this.initialTitle;

    }

    /**
     * 
     * @param onChangeFn 
     * ```
     * (value: any, select: UISelect) => { } 
     * ```
     */
    public setOnChange(onChangeFn: Function)
    {
        const $ = this;
        this.onSelectionChanged = onChangeFn
        this.select.onselectionchange = () =>
        {
            if (!Misc.isNull($.onSelectionChanged))
                $.onSelectionChanged($.value(), $)
        }
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
                    if (!Misc.isNull(this.onSelectionChanged))
                        this.onSelectionChanged(option.value, this)
                    return;
                }
            }
        } catch (error)
        {
            this.processError(error);
        }
    }

    private itemsSource: Array<any> = [];
    valueProperty?: string;
    displayProperty?: string;

    public fromList(models: Array<any>,
        valueProperty?: string,
        displayProperty?: string): void
    {
        if (models == null || models == undefined) return;
        try
        {
            this.valueProperty = valueProperty;
            this.displayProperty = displayProperty;
            this.itemsSource = models;
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

    /**
     * Gets the selected object-value item
     * Its works only when uses 'fromList(...)' UISelect function
     * @returns T
     */
    public getSelectedItem<T extends any | object>(): T
    {
        var val = this.value(); //key value of object-item
        for (var i = 0; i < this.itemsSource.length; i++)
        {
            var itemObj = this.itemsSource[i];
            if (itemObj[this.valueProperty] == val)
                return itemObj as unknown as T;
        }
        return null;
    }

    public value(): any
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
        this.divContainer.style.visibility = (visible ? 'visible' : 'hidden')
    }

    public setEnabled(enabled: boolean): void
    {
        this.select.disabled = (enabled == false);
    }
}