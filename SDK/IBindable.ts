import { WidgetBinder } from "./WidgetBinder";


/**
 * Implementing this interface will make a
 * Widget compatible with Data Binding features
 */
export interface IBindable
{
    /**
     * Produces an instance of the `WidgetBinder` implementation. 
     * This class is responsible for controlling the data binding 
     * flow for this Widget
     */
    getBinder(): WidgetBinder;
}