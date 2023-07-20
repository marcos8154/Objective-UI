"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.WidgetBinder = void 0;
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
class WidgetBinder {
    constructor(widget) {
        this.widget = widget;
        this.widgetName = widget.widgetName;
        this.bindingName = `${typeof (widget)}Binding ${this.widgetName} => ${typeof (widget)}`;
    }
    getModelPropertyValue() {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return null;
        var value = this._viewModel[this.modelPropertyName];
        return value;
    }
    setModelPropertyValue(value) {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return;
        this._viewModel[this.modelPropertyName] = value;
    }
    toString() {
        return this.bindingName;
    }
    hasPath(displayPropertyName, valuePropertyName) {
        this.bindingHasPath = true;
        this.displayProperty = displayPropertyName;
        this.valueProperty = valuePropertyName;
        this.refreshUI();
        return this;
    }
    hasTarget(targetValuePropertyName) {
        this.modelTargetPropertyName = targetValuePropertyName;
        return this;
    }
    isTargetDefined() {
        return this.modelTargetPropertyName != null;
    }
    fillModelTargetPropertyValue() {
        if (this.isTargetDefined() == false)
            return;
        var value = this.getWidgetValue();
        this._viewModel[this.modelTargetPropertyName] = value;
    }
    getModelTargetPropertyValue() {
        if (this.isTargetDefined() == false)
            return;
        var value = this._viewModel[this.modelTargetPropertyName];
        return value;
    }
    setModel(viewModelInstance, propertyName) {
        this._viewModel = viewModelInstance;
        this.modelPropertyName = propertyName;
        this.bindingName = `${typeof (this.widget)}Binding ${this.widgetName} => ${typeof (this.widget)}.${this.modelPropertyName}`;
        this.refreshUI();
    }
}
//exports.WidgetBinder = WidgetBinder;
