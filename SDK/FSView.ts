import { ViewLayout } from './ViewLayout';
import { FSWidget, WidgetContext } from './FSWidget'
import { FSWidgetContext } from './FSWidgetContext';
import { WidgetMessage } from './WidgetMessage';
import { ILayoutPresenter } from './ILayoutPresenter';
import { DefaultLayoutPresenter } from './DefaultLayoutPresenter';
import { PageShell as PageShell } from './PageShell';
import { INotifiable } from './INotifiable';
import { FSTemplateView } from './controls/FSTemplateView';

export abstract class FSView implements INotifiable
{
    abstract buildLayout(): ViewLayout;
    abstract composeView(): void;
    public onWidgetMessage(message: WidgetMessage): void
    {

    }

    private view: FSView;
    protected shellPage: PageShell;
    private widgetContext: FSWidgetContext;
    private customPresenter?: ILayoutPresenter;
    protected buildedLayout: ViewLayout;

    constructor(customLayoutPresenter?: ILayoutPresenter)
    {
        this.customPresenter = customLayoutPresenter;
    }

    abstract onViewDidLoad(): void;

    protected viewContext(): FSWidgetContext
    {
        return this.widgetContext;
    }

    protected inflateTemplateView(rawHtml: string) : FSTemplateView
    {
        return new FSTemplateView(rawHtml, this.shellPage);
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

        this.widgetContext = new FSWidgetContext(
            this.shellPage,
            layoutCollection,
            this.onWidgetMessage);

        this.view = this;
        this.view.composeView();
        this.widgetContext.build(this);
    }

    public managedWidgets():Array<FSWidget>
    {
        if (this.widgetContext == null || this.widgetContext == undefined)
            return [];
        return this.widgetContext.getManagedWidgets();
    }

    protected addWidgets(layoutId: string, ...widgets: FSWidget[]): void
    {
        for (var i = 0; i < widgets.length; i++)
            this.widgetContext.addWidget(layoutId, widgets[i]);
    }

    protected removeWidget(widget: FSWidget): void
    {
        this.viewContext().removeWidget(widget);
    }

    protected findWidget(layoutId: string, widgetName: string): FSWidget
    {
        return this.viewContext().findWidget(layoutId, widgetName);
    }

    protected createWidgetContext(managedDivIds: string[], messageProtocol?: Function): FSWidgetContext
    {
        if (null == this.shellPage || undefined == this.shellPage)
            throw 'FSView.createWidgetContext(): It is not possible to do this as the View is not yet initialized. If you are making this call inside the constructor(), move it inside the composeView() function.';

        return new FSWidgetContext(
            this.shellPage,
            managedDivIds,
            messageProtocol
        );
    }
}