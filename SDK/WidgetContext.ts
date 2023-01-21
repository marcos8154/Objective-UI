import { PageShell } from "./PageShell";
import { WidgetFragment, WidgetMessage, Widget } from "./Widget";
import { INotifiable } from "./INotifiable";

/**
 * A WidgetContext is able to manage a 
 * set of widgets linked in a div
 * contained in a `ViewLayout`
 * 
 * This is automatically managed by the UIView, 
 * but new WidgetContext's can be dynamically 
 * created to manage another portion of Widgets 
 * located in other Divs.
 */
export class WidgetContext
{

    fragments: WidgetFragment[];
    messageProtocolFunction?: Function;
    fragmentsLoaded: number;
    notifiableView?: INotifiable; //based on FSView
    shellPage: PageShell;
    ctx: WidgetContext;
    contextLoaded: boolean = false;

    constructor(shellPage: PageShell,
        managedElementsIds: string[],
        messageProtocolFunction?: Function)
    {
        this.fragments = [];
        this.messageProtocolFunction = messageProtocolFunction;

        var self = this;
        self.shellPage = shellPage;

        for (var i = 0; i < managedElementsIds.length; i++)
        {
            var elementId = managedElementsIds[i];
            var divElement = shellPage.elementById(elementId) as HTMLDivElement;
            self.fragments.push(new WidgetFragment(self, divElement));
        }
    }
    contextShell(): PageShell
    {
        return this.shellPage;
    }

    findFragment(fragmentName: string): WidgetFragment
    {
        for (var i = 0; i < this.fragments.length; i++)
        {
            var fragment: WidgetFragment = this.fragments[i];
            if (fragment.fragmentId == fragmentName)
                return fragment;
        }
        return null as unknown as WidgetFragment;
    }

    findWidget(fragmentName: string, widgetName: string)
    {
        var fragment: WidgetFragment = this.findFragment(fragmentName);
        var widget: Widget = fragment.findWidget(widgetName);
        return widget;
    }

    get(path: string)
    {
        const fragmentName: string = path.split('/')[0];
        const widgetName: string = path.split('/')[1];
        var fragment: WidgetFragment = this.findFragment(fragmentName);
        var widget: Widget = fragment.findWidget(widgetName);
        return widget;
    }

    pushMessage(widgetName: string, messageId: number, messageText: string, messageAnyObject: object)
    {
        if (this.messageProtocolFunction != null)
        {
            this.messageProtocolFunction(
                new WidgetMessage(
                    widgetName,
                    messageId,
                    messageText,
                    messageAnyObject
                )
            );
        }
    }

    /**
     * Attaches a Widget to a `WidgetFragment`.
     * A `WidgetFragment` is the direct controller of ONE 
     * div and can manage multiple Widgets related to this div
     */
    addWidget(fragmentName: string, widget: Widget)
    {
        var fragment = this.findFragment(fragmentName);
        fragment.attatchWidget(widget);

        if (this.contextLoaded)
        {
            fragment.renderFragmentwidgets();
        }

        return this;
    }

    getManagedWidgets(): Array<Widget>
    {
        try
        {
            var widgets: Array<Widget> = [];
            for (var frg = 0; frg < this.fragments.length; frg++)
            {
                var fragment: WidgetFragment = this.fragments[frg];
                for (var wdg = 0; wdg < fragment.widgets.length; wdg++)
                {
                    var widget: Widget = fragment.widgets[wdg];
                    widgets.push(widget);
                }
            }
            return widgets;
        } 
        catch(e)
        {
            return [];
        }
    }

    removeWidget(widget: Widget)
    {
        if (widget == null) return;
        var fragment = widget.getOwnerFragment();
        if (fragment == null) return;
        fragment.dettatchwidget(widget);
    }

    onFragmentLoad()
    {
        this.fragmentsLoaded += 1;
        if (this.fragmentsLoaded == this.fragments.length)
        {
            this.contextLoaded = true;
            if (this.notifiableView != null)
                this.notifiableView.onNotified('FSWidgetContext', []);
        }
    }

    /**
     * Performs the rendering of the Widgets attached to this Context.
     * Immediately orders the Fragments managed by this Context to draw 
     * the Widgets they manage.
     * @param notifiable 
     * @param clear 
     */
    build(notifiable?: INotifiable, clear: boolean = false)
    {
        this.fragmentsLoaded = 0;
        this.notifiableView = notifiable;

        for (var i = 0; i < this.fragments.length; i++)
        {
            var fragment: WidgetFragment = this.fragments[i];
            if (clear == true)
                fragment.clear();

            fragment.renderFragmentwidgets();
        }
    }
}