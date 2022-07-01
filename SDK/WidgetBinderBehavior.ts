import { WidgetBinder } from "./WidgetBinder";

export class WidgetBinderBehavior
{
    private _binders: Array<WidgetBinder>;
    constructor(binders: Array<WidgetBinder>)
    {
        this._binders = binders;
    }

    hasPath(displayPropertyName: string, valuePropertyName: string): WidgetBinderBehavior
    {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].hasPath(displayPropertyName, valuePropertyName);
        return this;
    }

    hasTarget(targetValuePropertyName: string): WidgetBinderBehavior
    {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].hasTarget(targetValuePropertyName);
        return this;
    }
}