/**
 * Implementing this interface in a common 
 * class will allow an isolated point of 
 * customization of a given Widget
 * 
 * You should transfer the instance of this 
 * implementation to the `setCustomPresenter()` 
 * function in the `Widget` object
 */
export interface ICustomWidgetPresenter<TWidget>
{
    render(widget: TWidget) : void;
}