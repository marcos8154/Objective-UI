"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.WidgetBinderBehavior = void 0;
/**
 *  Allows you to define binding behaviors for a
 * set of `WidgetBinder`
 * classes that are bound to a property/key of
 * the object-model being managed by the `BindingContext<T>`
 */
class WidgetBinderBehavior {
    constructor(binders) {
        this._binders = binders;
    }
    /**
     * When data binding is done based on a list of model objects,
     * it may be necessary to specify a binding path INSIDE that model
     * object via its properties/keys.
     *
     * This happens for example when binding a
     * list of `'Contact'` in `UISelect` or `UIList`:
     * although they are able to load an Array<Contact>,
     * they won't know that they should use the prop/key 'Id'
     * like selection value and the 'Name' prop/key as
     * the display value.
     * @param displayPropertyName The prop/key on the model object that will be displayed in the control
     * @param valuePropertyName The prop/key in the model object that will be used as the selected value in the Widget
     */
    hasPath(displayPropertyName, valuePropertyName) {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].hasPath(displayPropertyName, valuePropertyName);
        return this;
    }
    /**
     * Set a target when you want the selected Widget
     * value to be transferred to a given property/key
     * in the same model-object.
     * @param targetValuePropertyName  Property/key in the model-class to which the selected Widget-value will be transferred.
     */
    hasTarget(targetValuePropertyName) {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].hasTarget(targetValuePropertyName);
        return this;
    }
}
//exports.WidgetBinderBehavior = WidgetBinderBehavior;
