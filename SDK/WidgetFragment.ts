import { Widget, WidgetContext } from './Widget'
import { INotifiable } from './INotifiable';
import { PageShell } from './PageShell';

/**
 * The WidgetFragment has the ability to "draw" Widget objects 
 * into a LayoutId (html div) of the page. It is under the control 
 * of a WidgetContext and can manage several child Widgets.
 * 
 * It is also capable of attaching and detaching Widgets,
 * brokering message requests sent by child-Widgets 
 * and submitting them to its own-WidgetContext.
 * 
 */
export class WidgetFragment implements INotifiable
{

    contextRoot: WidgetContext;
    fragmentId: string;
    containerElement: HTMLDivElement;
    widgets: Widget[];
    widgetsLoaded: number;

    /**
     * 
     * @param appContextRoot The parent WidgetContext
     * @param containerElement An (Element object) HTML element to compose the adjacent Widgets. Usually Div's.
     */
    constructor(appContextRoot: WidgetContext, containerElement: HTMLDivElement)
    {
        this.contextRoot = appContextRoot;
        this.fragmentId = containerElement.getAttribute('id');

        //div object (not id)
        this.containerElement = containerElement;
        this.widgets = [];
    }

    clear()
    {
      this.containerElement.innerHTML = '';
    }

    /**
     * Submit a message request sent by the Widget directed to the parent-Context
     * @param widgetName The widget instance-name
     * @param messageId An "ID" of the message. The Widget may have its own message ID catalog for its respective handling cases.
     * @param messageText A text for the message
     * @param messageAnyObject Any object defined by the Widget itself. There are no restrictions on the object type.
     */
    pushMessageToRoot(
        widgetName: string,
        messageId: number,
        messageText: string,
        messageAnyObject: object): void
    {

        this.contextRoot.pushMessage(widgetName,
            messageId,
            messageText,
            messageAnyObject);
    }

    /**
     * Gets an Widget object instance
     * @param name Widget Instance Name
     * @returns Widget
     */
    findWidget(name: string): Widget
    {
        for (var i = 0; i < this.widgets.length; i++)
        {
            var widget: Widget = this.widgets[i];
            if (widget.widgetName == name)
                return widget;
        }

        return null;
    }

    /**
     * (Internal) method responsible for controlling the 
     * Widgets loading stack, and immediately notifying 
     * the parent-Context when the stack is
     * terminated.
     */
    private onWidgetLoad()
    {
        this.widgetsLoaded += 1;
        if (this.widgetsLoaded == this.widgets.length) //stack is end
            this.contextRoot.onFragmentLoad(); //notify to parent-ctx: "all Widgets been loaded :)""
    }

    resetFragment(): void
    {
        this.containerElement.innerHTML = '';
    }

    /**
     * Renders the Child Widgets stack on the specified Container
     */
    renderFragmentwidgets()
    {
        this.widgetsLoaded = 0;

        if (this.widgets.length == 0)
            this.contextRoot.onFragmentLoad();
        else
        {
            var self = this;
            var shell: PageShell = this.contextRoot.contextShell();

            self.containerElement.style.opacity = '0';

            for (var i = 0; i < self.widgets.length; i++)
            {
                var widget = self.widgets[i];
                widget.renderView(this as INotifiable);
            }

            var opacity = 0;
            var interv =     setInterval(function(){
                if (opacity < 1)
                {
                    opacity = opacity + 0.070
                    self.containerElement.style.opacity = opacity.toString();
                }
                else clearInterval(interv);
            });
        }
    }

    onNotified(sender: any, args: any[]): void
    {
        if (sender == 'FSWidget')
            this.onWidgetLoad();
    }

    /**
     * Attach a Widget to the Fragment
     * @param widget An Widget object
     */
    attatchWidget(widget: Widget)
    {
        for (var i = 0; i < this.widgets.length; i++)
        {
            var existingWidget: Widget = this.widgets[i];
            if (widget.widgetName == existingWidget.widgetName)
                throw `widget '${widget.widgetName}' has already been attached to this context.`;
        }

        widget.setParentFragment(this);
        this.widgets.push(widget);
    }

    /**
     * Detach a Widget from the Fragment
     * @param widget An Widget object 
     */
    dettatchwidget(widget: Widget): void
    {
        var toRemove = -1;
        for (let index = 0; index < this.widgets.length; index++)
        {
            var existingWidget: Widget = this.widgets[index];
            if (existingWidget.widgetName == widget.widgetName)
            {
                toRemove = index;
                break;
            }
        }

        if (toRemove > -1)
        {
            this.widgets.splice(toRemove, 1);
            this.containerElement.removeChild(widget.getDOMElement());
            widget.onWidgetDetached();
        }
    }

    appendChildElementToContainer(elementChild: Element)
    {
        this.contextRoot.contextShell().appendChildToElement(
            this.containerElement,
            elementChild
        );
    }
}