import { Widget } from "./Widget"
import { WebAPI } from "./WebAPI";

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
    private modelTargetPropertyName?: string;

    public bindingHasPath: boolean;
    public displayProperty: string;
    public valueProperty: string;

    constructor(widget: Widget) 
    {
        this.widget = widget;
        this.widgetName = widget.widgetName;
        this.bindingName = `${typeof (widget)}Binding ${this.widgetName} => ${typeof (widget)}`;
    }

    getModelPropertyValue(): any | object
    {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return null;
        var value = this._viewModel[this.modelPropertyName];
        return value;
    }

    setModelPropertyValue(value: any|object): void
    {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return;
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
        this.modelTargetPropertyName = targetValuePropertyName;
        return this;
    }

    isTargetDefined(): boolean
    {
        return this.modelTargetPropertyName != null;
    }

    fillModelTargetPropertyValue(): void
    {
        if(this.isTargetDefined() == false) return;
        var value = this.getWidgetValue();
        this._viewModel[this.modelTargetPropertyName] = value;
    }

    getModelTargetPropertyValue(): any|object
    {
        if(this.isTargetDefined() == false) return;
        var value = this._viewModel[this.modelTargetPropertyName];
        return value;
    }

    setModel(viewModelInstance: any|object, propertyName: string): void
    {
        this._viewModel = viewModelInstance;
        this.modelPropertyName = propertyName;
        this.bindingName = `${typeof (this.widget)}Binding ${this.widgetName} => ${typeof (this.widget)}.${this.modelPropertyName}`;

        this.refreshUI();
    }
}