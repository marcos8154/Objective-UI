import { FSView } from "./FSView";
import { FSWidget } from "./FSWidget";
import { IBindable } from "./IBindable";
import { WidgetBinder } from "./WidgetBinder";
import { WidgetBinderBehavior } from "./WidgetBinderBehavior";

export class BindingContext<ViewModel>
{
    private _binders: Array<WidgetBinder> = [];
    private viewModelInstance: ViewModel;
    constructor(viewModel: ViewModel, view: FSView)
    {
        this.viewModelInstance = viewModel;
        this.scanViewModel(view);
    }

    public getBindingFor(modelPropertyName: string): WidgetBinderBehavior
    {
        var propBinders: Array<WidgetBinder> = [];
        for (var i = 0; i < this._binders.length; i++)
        {
            var binder: WidgetBinder = this._binders[i];
            if (binder.modelPropertyName == modelPropertyName)
                propBinders.push(binder);
        }
        return new WidgetBinderBehavior(propBinders);
    }

    public refreshAll(): void
    {
        for (var b = 0; b < this._binders.length; b++)
        {
            var binder: WidgetBinder = this._binders[b];
            binder.refreshUI();
        }
    }

    public getViewModel<ViewModel>(): ViewModel
    {
        return this.viewModelInstance as unknown as ViewModel;
    }

    public setViewModel(viewModelInstance: ViewModel): BindingContext<ViewModel>
    {
        this.viewModelInstance = viewModelInstance;
        for (var b = 0; b < this._binders.length; b++)
        {
            var binder: WidgetBinder = this._binders[b];
            binder.setModel(this.viewModelInstance, binder.modelPropertyName);
        }
        this.refreshAll();
        return this;
    }

    private scanViewModel(view: FSView): void
    {
        var self = this;
        var widgets: Array<FSWidget> = view.managedWidgets();
        if (widgets == null || widgets == undefined || widgets.length == 0)
            throw new Error("Illegal declaration: BindingContext cannot be initialized by the View's constructor. Consider instantiating it in onViewDidLoad()");

        for (var key in self.viewModelInstance)
        {
            for (var w = 0; w < widgets.length; w++)
            {
                var widget: FSWidget = widgets[w];
                var keyMatch: boolean = self.modelPropertyMatchWithWidget(widget, key);
                if (keyMatch)
                    this.bindWidget(widget, key);
            }
        }
    }

    private bindWidget(widget: FSWidget, modelKey: string): WidgetBinder
    {
        try
        {
            var binder: WidgetBinder = (widget as unknown as IBindable).getBinder();
            if (binder == null || binder == undefined)
                return null;

            binder.setModel(this.viewModelInstance, modelKey);
            this._binders.push(binder);
            return binder;
        } catch {
            return null;
        }
    }

    private modelPropertyMatchWithWidget(widget: FSWidget, modelKey: string): boolean
    {
        var widgetName: string = widget.widgetName;
        if (widgetName.indexOf(modelKey) < 0) return false;
        var replaced: string = widgetName.replace(modelKey, '');
        var propLength: number = modelKey.length;
        var replacedLength: number = replaced.length;
        return (replacedLength < propLength);
    }
}