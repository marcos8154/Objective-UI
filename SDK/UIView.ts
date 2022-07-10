import { ViewLayout } from './ViewLayout';
import { Widget, WidgetContext } from './Widget'
import { WidgetMessage } from './WidgetMessage';
import { ILayoutPresenter } from './ILayoutPresenter';
import { PageShell as PageShell } from './PageShell';
import { INotifiable } from './INotifiable';
import { UITemplateView } from './controls/UITemplateView';
import { AppStorage } from './AppStorage';

/**
 * A UIView represents an interface view set of user controls.
 * UIView's are loaded and unloaded all the time and they 
 * house a set of Widgets that give meaning to the view in 
 * front of the user. 
 * 
 * We can say in general terms that 
 * "this is a 'screen' of the application"
 */
export abstract class UIView implements INotifiable
{
    /**
     * You must return a `ViewLayout` class instance to 
     * define the layout demarcations for this View
     */
    abstract buildLayout(): ViewLayout;

    /**
     * You must attach your Widgets variables with the divs 
     * contained in the Layout. 
     * Inside here, call the `this.addWidgets(...)` function
     */
    abstract composeView(): void;

    /**
     * When the entire View has been rendered, 
     * you can manipulate the Widgets properties, attributes, styles 
     * and other features here.
     */
    abstract onViewDidLoad(): void;

    /**
     * (Optional overwrite) occurs when a Widget sends a message
     */
    public onWidgetMessage(message: WidgetMessage): void
    { }

    private view: UIView;
    protected shellPage: PageShell;
    private widgetContext: WidgetContext;
    private customPresenter?: ILayoutPresenter;
    protected buildedLayout: ViewLayout;

    constructor(customLayoutPresenter?: ILayoutPresenter)
    {
        this.customPresenter = customLayoutPresenter;
    }

    protected requestLocalStorage(schemaName: string): AppStorage
    {
        return this.shellPage.requestStorage('local', schemaName);
    }

    protected requestSessionStorage(schemaName: string): AppStorage
    {
        return this.shellPage.requestStorage('session', schemaName);
    }

    protected viewContext(): WidgetContext
    {
        return this.widgetContext;
    }

    protected inflateTemplateView(rawHtml: string) : UITemplateView
    {
        return new UITemplateView(rawHtml, this.shellPage);
    }

    onNotified(sender: any, args: any[]): void
    {
        if (sender == 'FSWidgetContext')
            this.onViewDidLoad();
    }

    public initialize(mainShell: PageShell)
    {
        this.shellPage = mainShell;

        this.buildedLayout = this.buildLayout();
        this.buildedLayout.render(mainShell, this.customPresenter);

        var layoutCollection: string[] = this.buildedLayout.ElementsIdCollection();

        this.widgetContext = new WidgetContext(
            this.shellPage,
            layoutCollection,
            this.onWidgetMessage);

        this.view = this;
        this.view.composeView();
        this.widgetContext.build(this);
    }

    /**
     * Get all Widgets attached and managed in this UIView
     */
    public managedWidgets():Array<Widget>
    {
        if (this.widgetContext == null || this.widgetContext == undefined)
            return [];
        return this.widgetContext.getManagedWidgets();
    }

    /**
     * Adds one or more Widgets to a div specified in `ViewLayout`
     * @param layoutId An 'Id' of div contained in the `ViewLayout` class
     * @param widgets An array of Widget objects that will be bound to 'layoutId'
     */
    protected addWidgets(layoutId: string, ...widgets: Widget[]): void
    {
        for (var i = 0; i < widgets.length; i++)
            this.widgetContext.addWidget(layoutId, widgets[i]);
    }

    /**
     * Remove a Widget managed by this UIView
     */
    protected removeWidget(widget: Widget): void
    {
        this.viewContext().removeWidget(widget);
    }

    /**
     * Finds a Widget managed by this UIView
     *
     * @param layoutId An 'Id' div contained in the `ViewLayout`class
     * @param widgetName The name of a Widget managed by this UIView and previously attached to the ViewLayout through the specified 'layoutId'
     */
    protected findWidget(layoutId: string, widgetName: string): Widget
    {
        return this.viewContext().findWidget(layoutId, widgetName);
    }

    /**
     * Create an alternative Widget Context that allows controlling 
     * a set of Widgets that are outside the main Div-app or that 
     * are in a different Div than the one used by the original 
     * Context of this UIView
     * @param managedDivIds The set of 'Id' divs managed by this Context Widget
     * @param messageProtocol A function that responds to the message triggered by this context indicating its complete loading
     */
    protected createWidgetContext(managedDivIds: string[], messageProtocol?: Function): WidgetContext
    {
        if (null == this.shellPage || undefined == this.shellPage)
            throw 'FSView.createWidgetContext(): It is not possible to do this as the View is not yet initialized. If you are making this call inside the constructor(), move it inside the composeView() function.';

        return new WidgetContext(
            this.shellPage,
            managedDivIds,
            messageProtocol
        );
    }
}