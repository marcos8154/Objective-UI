"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.BindingContext = void 0;
/**
 * An efficient system of data binding and object synchronization (aka 'ViewModel')
 * with the User Interface
 *
 * Voce
 */
class BindingContext {
    /**
     * This is a concrete class and you should instantiate it normally,
     * You must provide an instance of the ViewModel and the inherited UIView currently displayed.
     * But ATTENTION you must do this INSIDE the onViewDidload() function of your UIView inherited class.
     *
     * ```
     *  export class MyView extends UIView {
     *     private binding: BindingContext<ModelType>;
     *     ...
     *     onViewDidload(): void {
     *        //Here Widgets attached in UIView will be linked with `ModelType`
     *        this.binding = new BindingContext<ModelType>(new ModelType(), this);
     *        ...
     *     }
     * ```
     * @param viewModel An instance of the ViewModel object
     * @param view UIView instance inherits class (the currently displayed UIView)
     */
    constructor(viewModel, view) {
        this._binders = [];
        this.viewModelInstance = viewModel;
        this.scanViewModel(view);
    }
    toString() {
        return '[BINDING-CONTEXT]';
    }
    /**
     * Gets a WidgetBinderBehavior from which the behavior of data bindings will be changed.
     * @param modelPropertyName The name of the property/key present in the ViewModelType type
     * @returns `WidgetBinderBehavior`
     */
    getBindingFor(modelPropertyName) {
        var propBinders = [];
        for (var i = 0; i < this._binders.length; i++) {
            var binder = this._binders[i];
            if (binder.modelPropertyName == modelPropertyName)
                propBinders.push(binder);
        }
        return new WidgetBinderBehavior(propBinders);
    }
    /**
     * Causes a UI refresh on all Widgets managed by this Data Binding Context
     * based on the current values of the properties/keys of the ViewModelType instance \
     * \
     * (remember that the ViewModelType instance is managed by this context as well)
     */
    refreshAll() {
        for (var b = 0; b < this._binders.length; b++) {
            var binder = this._binders[b];
            binder.refreshUI();
        }
    }
    /**
     * Get an instance of `ViewModel` based on Widgets values
     * @returns `ViewModel`
     */
    getViewModel() {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].fillPropertyModel();
        return this.viewModelInstance;
    }
    /**
     * Defines an instance of `ViewModel`.\
     * This causes an immediate UI refresh on all widgets managed by this context. \
     * \
     * You can also use this to reset (say 'clear') the Widgets state by passing a `new ViewModel()`
     * @param viewModelInstance `ViewModel`
     * @returns
     */
    setViewModel(viewModelInstance) {
        this.viewModelInstance = viewModelInstance;
        for (var b = 0; b < this._binders.length; b++) {
            var binder = this._binders[b];
            binder.setModel(this.viewModelInstance, binder.modelPropertyName);
        }
        this.refreshAll();
        return this;
    }
    /**
     * Scans the Widgets managed in a UIView for matches with
     * properties/keys present in the ViewModel type object
     * managed by this Context
     */
    scanViewModel(view) {
        var self = this;
        var widgets = view.managedWidgets();
        if (widgets == null || widgets == undefined || widgets.length == 0)
            throw new Error("Illegal declaration: BindingContext cannot be initialized by the View's constructor. Consider instantiating it in onViewDidLoad()");
        for (var key in self.viewModelInstance) {
            for (var w = 0; w < widgets.length; w++) {
                var widget = widgets[w];
                var keyMatch = self.isModelPropertyMatchWithWidget(widget, key);
                if (keyMatch)
                    this.bindWidget(widget, key);
            }
        }
    }
    isModelPropertyMatchWithWidget(widget, modelKey) {
        var widgetName = widget.widgetName;
        if (widgetName.indexOf(modelKey) < 0)
            return false;
        var replaced = widgetName.replace(modelKey, '');
        var propLength = modelKey.length;
        var replacedLength = replaced.length;
        return (replacedLength < propLength);
    }
    bindWidget(widget, modelKey) {
        try {
            var binder = widget.getBinder();
            if (binder == null || binder == undefined)
                return null;
            binder.setModel(this.viewModelInstance, modelKey);
            this._binders.push(binder);
            return binder;
        }
        catch (_a) {
            return null;
        }
    }
}
//exports.BindingContext = BindingContext;
