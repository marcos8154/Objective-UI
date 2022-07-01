export interface ICustomWidgetPresenter<TWidget>
{
    render(widget: TWidget) : void;
}