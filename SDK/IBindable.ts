import { WidgetBinder } from "./WidgetBinder";

export interface IBindable
{
    getBinder(): WidgetBinder;
}