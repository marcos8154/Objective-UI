import { ViewLayout } from './ViewLayout';
import { Widget, WidgetContext } from './Widget'
import { WidgetMessage } from './WidgetMessage';
import { ILayoutPresenter } from './ILayoutPresenter';
import { PageShell as PageShell } from './PageShell';
import { INotifiable } from './INotifiable';
import { UITemplateView } from './controls/UITemplateView';
import { AppStorage } from './AppStorage';

export abstract class View implements INotifiable
{
    abstract buildLayout(): ViewLayout;
    abstract composeView(): void;
    public onWidgetMessage(message: WidgetMessage): void
    { }

    private view: View;
    protected shellPage: PageShell;
    private widgetContext: WidgetContext;
    private customPresenter?: ILayoutPresenter;
    protected buildedLayout: ViewLayout;

    constructor(customLayoutPresenter?: ILayoutPresenter)
    {
        this.customPresenter = customLayoutPresenter;
    }

    abstract onViewDidLoad(): void;

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

    public managedWidgets():Array<Widget>
    {
        if (this.widgetContext == null || this.widgetContext == undefined)
            return [];
        return this.widgetContext.getManagedWidgets();
    }

    protected addWidgets(layoutId: string, ...widgets: Widget[]): void
    {
        for (var i = 0; i < widgets.length; i++)
            this.widgetContext.addWidget(layoutId, widgets[i]);
    }

    protected removeWidget(widget: Widget): void
    {
        this.viewContext().removeWidget(widget);
    }

    protected findWidget(layoutId: string, widgetName: string): Widget
    {
        return this.viewContext().findWidget(layoutId, widgetName);
    }

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