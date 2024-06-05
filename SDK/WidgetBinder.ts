import { Widget } from "./Widget"
import { WebAPI } from "./WebAPI";
import { Misc } from "./Misc";
import { DefaultExceptionPage } from "./DefaultExceptionPage";

/**
 * It acts as a bridge between the `BindingContext<T>` 
 * and the respective Widget. 
 * 
 * This allows the Widget to incorporate Data Binding 
 * functionality with model-objects.
 * 
 * If you have a custom `Widget` created in your project, 
 * you will need to provide a `WidgetBinder` implementation 
 * to provide Data Binding functionality
 */
export abstract class WidgetBinder
{

    abstract getWidgetValue(): any | object;
    abstract refreshUI(): void;
    abstract fillPropertyModel(): void;

    protected widget: Widget;
    public widgetName: string;
    private bindingName: string;

    private _viewModel: any | object;
    public modelPropertyName: string;
    public modelTargetProperty?: string;

    public bindingHasPath: boolean;
    public displayProperty: string;
    public valueProperty: string;

    private validateFn: Function;

    constructor(widget: Widget) 
    {
        this.widget = widget;
        this.widgetName = widget.widgetName;
        this.bindingName = `${typeof (widget)}Binding ${this.widgetName} => ${typeof (widget)}`;
    }

    addValidation(validateFn: Function)
    {
        this.validateFn = validateFn;
    }

    public hasValidation()
    {
        return !Misc.isNull(this.validateFn);
    }

    public validate(): boolean
    {
        var val = this.getModelPropertyValue()
        var result = this.validateFn(val)
        if (Misc.isNull(result))
            throw new DefaultExceptionPage(new Error(`WidgetBinder: invalid result of validation function for property '${this.modelPropertyName}'. Check if validation function contains a 'return true|false' instruction. `));

        if (result == true || result == false)
            return result as boolean;

        throw new DefaultExceptionPage(new Error(`WidgetBinder: invalid result of validation function for property '${this.modelPropertyName}'. Check if validation function contains a 'return true|false' instruction. `));
    }

    getModelPropertyValue(): any | object
    {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return null;
        var value = this._viewModel[this.modelPropertyName];
        return value;
    }

    setModelPropertyValue(value: any | object): void
    {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return;

        var mValue = this.getModelPropertyValue()
        if (typeof mValue == 'number')
            value = parseFloat(value)
        if (typeof mValue == 'boolean')
            value = (`${value}`.toLocaleLowerCase() == 'true' ? true : false)

        if (`${value}` == 'NaN')
            value = 0

        this._viewModel[this.modelPropertyName] = value;
    }

    toString(): string
    {
        return this.bindingName;
    }

    hasPath(displayPropertyName: string, valuePropertyName: string): WidgetBinder
    {
        this.bindingHasPath = true;
        this.displayProperty = displayPropertyName;
        this.valueProperty = valuePropertyName;
        this.refreshUI();
        return this;
    }

    hasTarget(targetValuePropertyName: string): WidgetBinder
    {
        this.modelTargetProperty = targetValuePropertyName;
        this.refreshUI();
        return this;
    }

    isTargetDefined(): boolean
    {
        return this.modelTargetProperty != null;
    }

    fillModelTargetPropertyValue(): void
    {
        if (this.isTargetDefined() == false) return;
        var value = this.getWidgetValue();

        var mValue = this.getModelTargetPropertyValue()
        if (typeof mValue == 'number')
            value = parseFloat(value);
        if (typeof mValue == 'boolean')
            value = (`${value}`.toLocaleLowerCase() == 'true' ? true : false)
        if (`${value}` == 'NaN')
            value = 0

        this._viewModel[this.modelTargetProperty] = value;
    }

    setModelTargetPropertyValue(value: any | object)
    {
        this._viewModel[this.modelTargetProperty] = value;
    }

    getModelTargetPropertyValue(): any | object
    {
        if (this.isTargetDefined() == false) return;
        var value = this._viewModel[this.modelTargetProperty];
        return value;
    }

    setModel(viewModelInstance: any | object, propertyName: string): void
    {
        this._viewModel = viewModelInstance;
        this.modelPropertyName = propertyName;
        this.bindingName = `${typeof (this.widget)}Binding ${this.widgetName} => ${typeof (this.widget)}.${this.modelPropertyName}`;

        this.refreshUI();
    }

    getViewModel<TModel>(): TModel
    {
        return this._viewModel as TModel
    }
}