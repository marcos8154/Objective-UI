export abstract class FSPage
{
    public static DISABLE_EXCEPTION_PAGE: boolean = false;
    protected mainShell: PageShell;
    constructor(doc: Document)
    {
        this.mainShell = new PageShell(doc, this);
    }

    protected enableSplitting(appContainerId: string, splitContainerId: string): void
    {
        this.mainShell.enableSplitting(appContainerId, splitContainerId);
    }

    protected setLibRoot(rootPath: string): void
    {
        PageShell.LIB_ROOT = rootPath;
    }

    protected importLib({ libName, cssPath, jsPath }: { libName: string; cssPath?: string; jsPath?: string; })
    {
        this.mainShell.import(new NativeLib({ libName, cssPath, jsPath }));
    }

    public navigateToView(view: FSView): void
    {
        try
        {
            view.initialize(this.mainShell);
        }
        catch(error)
        {
            new DefaultExceptionPage(error as Error);
        }
    }
}
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
export abstract class FSWidget implements INotifiable
{
    /**
     * This function (in the inherited object) is triggered when "renderView()" 
     * manages to get the HTML resource from the WebDir and bind it to this Widget.
     * 
     * Within this function, it is possible to access and manipulate the DOM Elements 
     * present in the HTML resource, by calling 
     * "elementById<TElement>(string)"
     */
    protected abstract onWidgetDidLoad(): void;
    protected abstract htmlTemplate(): string;

    /**
     * Occurs when the Widget is detached from the WidgetContext
     */
    public onWidgetDetached(): void
    {

    }

    /**
     * Defines an instance (of the implementation) of a custom presenter for this Widget.
     *  
     * Custom presenter may contain some specific logic for styling the DOM elements managed by these Widgets.
     * @param presenter 
     */
    public abstract setCustomPresenter(presenter: ICustomWidgetPresenter<FSWidget>): void;

    /**
     * Gets the default value of this widget; Note that not every Widget will implement the return of its value by this function.
     */
    public abstract value(): string;

    public abstract setEnabled(enabled: boolean): void

    /**
     * Add a CSS class by name; Some Widgets may not implement this eventually.
     * @param className CSS class name
     */
    public abstract addCSSClass(className: string): void;

    /**
     * Remove a CSS class by name; Some Widgets may not implement this eventually.
     * @param className CSS class name
     */
    public abstract removeCSSClass(className: string): void;

    /**
     * Applies a CSS property value; Some Widgets may not implement this eventually.
     * @param propertyName CSS property name
     * @param propertyValue Property value
     */
    public abstract applyCSS(propertyName: string, propertyValue: string): void;

    /**
     * Change Widget Position
     * @param position Position mode. Valid values are: 'absolute', 'relative', 'fixed', 'sticky', 'static' https://developer.mozilla.org/pt-BR/docs/Web/CSS/position
     * @param marginBottom A margin bottom value
     * @param marginLeft A margin left value
     * @param transform (optional) indicates the CSS value of 'Transform' https://developer.mozilla.org/pt-BR/docs/Web/CSS/transform
     */
    public abstract setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void;

    /**
     * Determines if this Widget is visible on the page
     * @param visible True or False
     */
    public abstract setVisible(visible: boolean): void;

    /**
     * 
     * @param propertyPairs Array item: [{ p: 'xxx', v: 'vvv'}, ...]
     */
    public applyAllCSS(propertyPairs: Array<any>): void
    {
        for (var i = 0; i < propertyPairs.length; i++)
        {
            var css = propertyPairs[i];
            this.applyCSS(css.p, css.v);
        }
    }

    public cssFromString(cssString: string): void
    {
        var statements = cssString.split(';');
        for(var i = 0; i < statements.length; i++)
        {
            var statement = statements[i];
            if(statement == '') continue;
            var parts = statement.split(':');
            if(parts.length == 0) continue;
            var key = parts[0].trim();
            if(key == '')continue;
            var value = parts[1].trim();
            this.applyCSS(key, value);
        }
    }

    public widgetName: string;

    private viewDictionary: ViewDictionaryEntry[];
    private DOM: Document; //DOM js object of html
    private parentFragment?: WidgetFragment;

    /**
     * 
     * @param resourceName The name of the html resource that will be fetched from the webdir and linked to this Widget
     * @param widgetName A name for this Widget instance
     */
    constructor(widgetName: string)
    {
        this.widgetName = widgetName;
        this.viewDictionary = [];
        this.DOM;
    }

    public replaceCSSClass(oldClass: string, newClass: string)
    {
        this.removeCSSClass(oldClass);
        this.addCSSClass(newClass);
    }

    public getPageShell(): PageShell
    {
        try
        {
            return this.getOwnerFragment()
                .contextRoot
                .shellPage;
        } catch (error)
        {
            throw new Error(`Attempt to access or manipulate an unattached Widget. Check if the Widget was attached during the composeView() function of the respective View that originated this call.`);
        }
    }


    /**
     * Get the fragment (page div) that this widget owns
     * @returns WidgetFragment
     */
    public getOwnerFragment(): WidgetFragment
    {
        return this.parentFragment;
    }

    /**
     * Determines the fragment (page div) that this widget owns
     */
    public setParentFragment(parentFragment: WidgetFragment): void
    {
        this.parentFragment = parentFragment;
    }

    /**
     * Sends a message from the inherited object towards the WidgetContext,
     * which then makes it available to the View in the "onWidgetMessage()" function call
     * @param messageId Set a default identifier for this message. This allows the receiver to determine the type of message (your widget may have some)
     * @param messageText A text for your message
     * @param messageAnyObject A custom data object
     */
    protected sendMessage(messageId: number, messageText: string, messageAnyObject: object): void
    {
        this.parentFragment?.pushMessageToRoot(this.widgetName, messageId, messageText, messageAnyObject);
    }

    protected processError(error: unknown)
    {
        new DefaultExceptionPage(error as unknown as Error);
        throw error;
    }

    /**
     * Get the Element object (DOM) respective to the entire html 
     * resource linked to the Widget 
     * 
     * If the HTML contains more than one element, you must use a DIV 
     * involving all of them and marked with an "id" attribute
     * @returns Element instance
     */
    public getDOMElement(): Element
    {
        if (this.viewDictionary.length == 0) return null;
        var firstId: string = this.viewDictionary[0].getOriginalId();
        return this.elementById(firstId);
    }


    /**
     * Gets a DOM object element from the value of the "id" attribute.
     * @param elementId Element id inside of the html template provided by inherited class
     * @returns 
     */
    protected elementById<TElement>(elementId: string): TElement
    {
        var pageShell = this.getPageShell();
        for (var i = 0; i < this.viewDictionary.length; i++)
        {
            var entry: ViewDictionaryEntry = this.viewDictionary[i];
            if (entry.getOriginalId() == elementId)
            {
                var elementResult: any = pageShell.elementById(entry.getManagedId());
                return elementResult;
            }
        }
        return null;
    }

    /**
    Adds an entry in the Id's dictionary. 
    The dictionary is used to prevent conflicting element IDs across the page.

    Before elements are attached to the page, a unique Id value is generated and (re)set 
    to the element. 

    The dictionary maintains exactly the parity of the auto-generated Id 
    with the original one, so that the inherited object can normally access 
    the elements present in the HTML resource by the original name.

     * @param originalId The Id of the element present in the HTML resource
     * @param generatedId The self-generated Id value
     */
    private addDictionaryEntry(originalId: string, generatedId: string)
    {
        var entry = new ViewDictionaryEntry(originalId, generatedId);
        this.viewDictionary.push(entry);
    }


    /**
     * This function is triggered by WidgetFragment and is responsible 
     * for fetching the HTML resource in WebDir and linking it to this Widget. 
     * 
     * From here, all elements present in the HTML marked with some "Id" 
     * attribute will be made availableas DOM Elements to the inherited object when 
     * "onWidgetDidLoad()" is invoked
     * @param onloadNotifiable An Notifiable to receive a notification when the Widget is rendered
     */
    public renderView(onloadNotifiable: INotifiable)
    {
        var self = this;

        this.viewDictionary = [];

        var html: string = this.htmlTemplate();
        var parser = new DOMParser();
        var domObj = parser.parseFromString(html, "text/html");
        var allIds = domObj.querySelectorAll('*[id]');

        for (var i = 0; i < allIds.length; i++)
        {
            var element = allIds[i];
            var currentId = element.getAttribute('id');
            if (currentId != null)
            {
                var newId = `${currentId}_${FSWidget.generateUUID()}`;
                self.addDictionaryEntry(currentId, newId);
                element.setAttribute('id', newId);
            }
        }

        self.DOM = domObj;

        var child: ChildNode = domObj.documentElement.childNodes[1].firstChild;
        self.parentFragment.appendChildElementToContainer(child as Element);

        self.onWidgetDidLoad();
        onloadNotifiable.onNotified('FSWidget', [self, domObj]);
    }


    onNotified(sender: any, args: any[]): void { }

    /**
     * Public Domain/MIT
     * 
     * This function generates a UUID (universal unique identifier value) to bind to an HTML element
     */
    public static generateUUID()
    {
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        var res = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
        {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0)
            {//Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else
            {//Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            var result = (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);

            return result;
        });

        return res.split('-')[0];
    }
}
export class FSWidgetContext
{

    fragments: WidgetFragment[];
    messageProtocolFunction?: Function;
    fragmentsLoaded: number;
    notifiableView?: INotifiable; //based on FSView
    shellPage: PageShell;
    ctx: FSWidgetContext;
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
        var widget: FSWidget = fragment.findWidget(widgetName);
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

    addWidget(fragmentName: string, widget: FSWidget)
    {
        var fragment = this.findFragment(fragmentName);
        fragment.attatchWidget(widget);

        if (this.contextLoaded)
        {
            fragment.renderFragmentwidgets();
        }

        return this;
    }

    getManagedWidgets(): Array<FSWidget>
    {
        try
        {
            var widgets: Array<FSWidget> = [];
            for (var frg = 0; frg < this.fragments.length; frg++)
            {
                var fragment: WidgetFragment = this.fragments[frg];
                for (var wdg = 0; wdg < fragment.widgets.length; wdg++)
                {
                    var widget: FSWidget = fragment.widgets[wdg];
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

    removeWidget(widget: FSWidget)
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
export class BindingContext<ViewModel>
{
    private _binders: Array<WidgetBinder> = [];
    private viewModelInstance: ViewModel;
    constructor(viewModel: ViewModel, view: FSView)
    {
        this.viewModelInstance = viewModel;
        this.scanViewModel(view);
    }

    public getBindingFor(modelPropertyName: string): WidgetBinderBehavior
    {
        var propBinders: Array<WidgetBinder> = [];
        for (var i = 0; i < this._binders.length; i++)
        {
            var binder: WidgetBinder = this._binders[i];
            if (binder.modelPropertyName == modelPropertyName)
                propBinders.push(binder);
        }
        return new WidgetBinderBehavior(propBinders);
    }

    public refreshAll(): void
    {
        for (var b = 0; b < this._binders.length; b++)
        {
            var binder: WidgetBinder = this._binders[b];
            binder.refreshUI();
        }
    }

    public getViewModel<ViewModel>(): ViewModel
    {
        return this.viewModelInstance as unknown as ViewModel;
    }

    public setViewModel(viewModelInstance: ViewModel): BindingContext<ViewModel>
    {
        this.viewModelInstance = viewModelInstance;
        for (var b = 0; b < this._binders.length; b++)
        {
            var binder: WidgetBinder = this._binders[b];
            binder.setModel(this.viewModelInstance, binder.modelPropertyName);
        }
        this.refreshAll();
        return this;
    }

    private scanViewModel(view: FSView): void
    {
        var self = this;
        var widgets: Array<FSWidget> = view.managedWidgets();
        if (widgets == null || widgets == undefined || widgets.length == 0)
            throw new Error("Illegal declaration: BindingContext cannot be initialized by the View's constructor. Consider instantiating it in onViewDidLoad()");

        for (var key in self.viewModelInstance)
        {
            for (var w = 0; w < widgets.length; w++)
            {
                var widget: FSWidget = widgets[w];
                var keyMatch: boolean = self.modelPropertyMatchWithWidget(widget, key);
                if (keyMatch)
                    this.bindWidget(widget, key);
            }
        }
    }

    private bindWidget(widget: FSWidget, modelKey: string): WidgetBinder
    {
        try
        {
            var binder: WidgetBinder = (widget as unknown as IBindable).getBinder();
            if (binder == null || binder == undefined)
                return null;

            binder.setModel(this.viewModelInstance, modelKey);
            this._binders.push(binder);
            return binder;
        } catch {
            return null;
        }
    }

    private modelPropertyMatchWithWidget(widget: FSWidget, modelKey: string): boolean
    {
        var widgetName: string = widget.widgetName;
        if (widgetName.indexOf(modelKey) < 0) return false;
        var replaced: string = widgetName.replace(modelKey, '');
        var propLength: number = modelKey.length;
        var replacedLength: number = replaced.length;
        return (replacedLength < propLength);
    }
}
export interface IBindable
{
    getBinder(): WidgetBinder;
}
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
export abstract class WidgetBinder
{
    abstract getWidgetValue(): any | object;
    abstract refreshUI(): void;
    abstract fillPropertyModel(): void;


    protected widget: FSWidget;
    public widgetName: string;
    private bindingName: string;

    private _viewModel: any | object;
    public modelPropertyName: string;
    private modelTargetPropertyName?: string;

    public bindingHasPath: boolean;
    public displayProperty: string;
    public valueProperty: string;

    constructor(widget: FSWidget) 
    {
        this.widget = widget;
        this.widgetName = widget.widgetName;
        this.bindingName = `${typeof (widget)}Binding ${this.widgetName} => ${typeof (widget)}`;
    }

    getModelPropertyValue(): any | object
    {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return null;
        var value = this._viewModel[this.modelPropertyName];
        return value;
    }

    setModelPropertyValue(value: any|object): void
    {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return;
        this._viewModel[this.modelPropertyName] = value;
    }

    toString(): string
    {
        return this.bindingName;
    }

    hasPath(displayPropertyName: string, valuePropertyName: string): WidgetBinder
    {
        this.bindingHasPath = true;
        this.displayProperty = displayPropertyName;
        this.valueProperty = valuePropertyName;
        this.refreshUI();
        return this;
    }

    hasTarget(targetValuePropertyName: string): WidgetBinder
    {
        this.modelTargetPropertyName = targetValuePropertyName;
        return this;
    }

    isTargetDefined(): boolean
    {
        return this.modelTargetPropertyName != null;
    }

    fillModelTargetPropertyValue(): void
    {
        if(this.isTargetDefined() == false) return;
        var value = this.getWidgetValue();
        this._viewModel[this.modelTargetPropertyName] = value;
    }

    getModelTargetPropertyValue(): any|object
    {
        if(this.isTargetDefined() == false) return;
        var value = this._viewModel[this.modelTargetPropertyName];
        return value;
    }

    setModel(viewModelInstance: any|object, propertyName: string): void
    {
        this._viewModel = viewModelInstance;
        this.modelPropertyName = propertyName;
        this.bindingName = `${typeof (this.widget)}Binding ${this.widgetName} => ${typeof (this.widget)}.${this.modelPropertyName}`;

        this.refreshUI();
    }
}
export class APIResponse
{
    public statusCode: number;
    public statusMessage: string;
    public content: any | object;

    constructor({ code, msg, content }:
        {
            code: number,
            msg: string,
            content: any | object,
        })
    {
        this.statusCode = code;
        this.statusMessage = msg;
        this.content = content;
    }
}

export class WebAPI
{
    private static urlBase: string;
    public static setURLBase(apiUrlBase: string)
    {
        WebAPI.urlBase = apiUrlBase;
    }

    public static requestTo(requestString: string, httpMethod: string)
    {
        if (requestString.startsWith('http'))
            return new WebAPI(requestString, httpMethod);
        else
        {
            if (this.urlBase == '' || this.urlBase == this.name || this.urlBase == undefined)
                throw new Error(`Calling directly '${requestString}' on API endpoints requires a previously configured base URL. Make sure you have previously invoked WebAPI.setURLBase( 'https://my-api.com' )`);
            return new WebAPI(`${WebAPI.urlBase}${requestString}`, httpMethod);
        }
    }

    public static useSimulator(simulator: WebAPISimulator): void
    {
        WebAPI.simulator = simulator;
    }

    public static GET(requestString: string)
    {
        return this.requestTo(requestString, 'GET');
    }

    public static POST(requestString: string)
    {
        return this.requestTo(requestString, 'POST');
    }

    public static PUT(requestString: string)
    {
        return this.requestTo(requestString, 'PUT');
    }

    public static DELETE(requestString: string)
    {
        return this.requestTo(requestString, 'DELETE');
    }

    private request: RequestInit;
    private apiUrl: string;
    private fnOnSuccess: Function;
    private fnOnError: Function;
    private static simulator: WebAPISimulator;

    private constructor(url: string, method: string)
    {
        this.request = {};
        this.request.method = method;
        this.apiUrl = url;
    }

    public call(): void
    {
        if (WebAPI.simulator == null)
        {
            var statusCode: number;
            var statusMsg: string;

            fetch(this.apiUrl, this.request)
                .then(function(ret){
                    statusCode = ret.status;
                    statusMsg = ret.statusText;

                    return ret.json()
                })
                .then(function (json)
                {
                    var apiResponse = new APIResponse({
                        code: statusCode, msg: statusMsg, content: json
                    });
                    return apiResponse;
                })
                .then(response => (this.fnOnSuccess == null ? {} : this.fnOnSuccess(response)))
                .catch(err => (this.fnOnError == null ? {} : this.fnOnError(err)));
        }
        else
        {
            try
            {
                var result = WebAPI.simulator.simulateRequest(
                    this.request.method,
                    this.apiUrl.replace(WebAPI.urlBase, ''),
                    this.request.body);

                this.fnOnSuccess(result);
            } catch (error)
            {
                this.fnOnError(error);
            }
        }
    }

    public onSuccess(callBack: Function): WebAPI
    {
        this.fnOnSuccess = callBack;
        return this;
    }

    public onError(callBack: Function): WebAPI
    {
        this.fnOnError = callBack;
        return this;
    }

    public withAllOptions(requestInit: RequestInit): WebAPI
    {
        this.request = requestInit;
        return this;
    }

    public withBody(requestBody: any | object): WebAPI
    {
        this.request.body = JSON.stringify(requestBody);
        return this;
    }

    public withHeaders(headers: Headers): WebAPI
    {
        this.request.headers = headers;
        return this;
    }
}
export class SimulatedAPIRoute
{
    private method: string;
    private resource: string;
    private endPoint: Function;

    constructor(resource: string, method: string, endPoint: Function)
    {
        this.method = method;
        this.resource = resource;
        this.endPoint = endPoint;
    }

    public getMethod()
    {
        return this.method;
    }

    public getResource()
    {
        return this.resource;
    }

    public simulateRoute({ body = null, params = null }:
        {
            body?: any | object,
            params?: Array<string>
        }): any
    {
        if (this.method == 'GET' || this.method == 'DELETE')
        {
            return this.endPoint(params);
        }
        else
            return this.endPoint(body);
    }

    public toString()
    {
        return `[${this.method}] ${this.resource}`;
    }
}

export abstract class WebAPISimulator
{
    private simulatedRoutes: Array<SimulatedAPIRoute> = [];

    /**
     * @param httpMethod **for GET/DELETE routes** - functionEndpoint(**params: Array**): any|object   
     *                   **for POST/PUT routes**   - functionEndpoint(**body: any|object**): any|object
     * @param resource 
     * @param endPoint functionEndpoint(params: Array): any|object;
     */
    protected mapRoute(httpMethod: string, resource: string, endPoint: Function): WebAPISimulator
    {
        this.simulatedRoutes.push(new SimulatedAPIRoute(resource, httpMethod, endPoint));
        return this;
    }

    public simulateRequest(
        httpMethod: string,
        resource: string,
        body: any | object): any | object
    {
        for (var i = 0; i < this.simulatedRoutes.length; i++)
        {
            const route: SimulatedAPIRoute = this.simulatedRoutes[i];
            const isResource = resource.startsWith(route.getResource());
            const isMethod = httpMethod == route.getMethod();

            if (isResource && isMethod)
            {
                if (route.getMethod() == 'GET' || route.getMethod() == 'DELETE')
                {
                    const path = resource.replace(route.getResource(), '');
                    var params = path.split('/');
                    if (params.length > 0)
                        if (params[0] == '') params = params.splice(-1, 1);
                    return new APIResponse({
                        code: 200,
                        msg: 'fetched from API Simulator',
                        content: route.simulateRoute({ params })
                    });
                }

                if (route.getMethod() == 'POST' || route.getMethod() == 'PUT')
                    return new APIResponse({
                        code: 200,
                        msg: 'ferched from API Simulator',
                        content: route.simulateRoute({ body: JSON.parse(body) })
                    })
                break;
            }
        }
    }
}
export class ColumnOptions
{
    //    id: string;
    colClass?: string;
    colHeight?: string;
    rows?: Row[];
}

export class Column
{
    id: string;
    colClass?: string = 'col-lg-12 col-md-12 col-sm-12 col-sm-12';
    colHeight?: string = '100px';
    columnRows?: Row[] = [];

    constructor(id: string, options?: ColumnOptions)
    {
        this.id = id;

        if (options != null)
        {
            if (Misc.isNullOrEmpty(options.colHeight) == false)
                this.colHeight = options.colHeight;

            if (Misc.isNullOrEmpty(options.colClass) == false)
                this.colClass = options.colClass;

            if (options.rows !== null)
                this.columnRows = options.rows;
        }
    }
}
export class DefaultLayoutPresenter implements ILayoutPresenter
{
    presenter: DefaultLayoutPresenter;
    private pageShell: PageShell;

    constructor()
    {
        this.presenter = this;
    }


    renderLayout(layout: ViewLayout, pageShell: PageShell): Element
    {
        this.pageShell = pageShell;
        var parentContainer: HTMLDivElement = layout.containerDivObj as HTMLDivElement;

        if (parentContainer == null) return null;

        parentContainer.innerHTML = '';
        // parentContainer.style.opacity = '0';

        for (let rowIndex = 0; rowIndex < layout.layoutRows.length; rowIndex++)
        {
            var rowObj: Row = layout.layoutRows[rowIndex];
            var rowView = this.renderRow(rowObj);
            parentContainer.appendChild(rowView);
        }

        return parentContainer;
    }

    private renderRow(row: Row): HTMLDivElement
    {

        //creates master row div
        const rowDiv: HTMLDivElement = document.createElement("div");
        if (row.rowClass != null && row.rowClass != undefined)
        {
            const classes: Array<string> = row.rowClass.split(' ');
            for (var i = 0; i < classes.length; i++)
            {
                const className = classes[i].trim();
                if (className == '') continue;
                rowDiv.classList.add(className);
            }
        }

        rowDiv.id = row.id;
        rowDiv.style.height = row.rowHeidth;

        if (row.rowColumns != null)
        {
            for (let index = 0; index < row.rowColumns.length; index++)
            {
                const column: Column = row.rowColumns[index];

                //an sub-div column
                const colDiv: HTMLDivElement = document.createElement("div");

                if (Misc.isNullOrEmpty(column.colClass) == false)
                {
                    const classes: Array<string> = column.colClass.split(' ');
                    for (var i = 0; i < classes.length; i++)
                    {
                        const className = classes[i].trim();
                        if(className == '') continue;
                        colDiv.classList.add(className);
                    }
                }

                colDiv.id = column.id;
                colDiv.style.height = column.colHeight;

                rowDiv.appendChild(colDiv);

                if (column.columnRows != null)
                {
                    for (let subRowIndex = 0; subRowIndex < column.columnRows.length; subRowIndex++)
                    {
                        //sub-div column has rows
                        const columnSubRow = column.columnRows[subRowIndex];

                        //recursivelly call renderRow() again,
                        const subRowElement = this.renderRow(columnSubRow);

                        //then catch Element result and append it to sub-div column (aka "colDiv")

                        if (subRowElement != null)
                            colDiv.appendChild(subRowElement);
                    }
                }
            }
        }
        return rowDiv;
    }
}
export interface ICustomWidgetPresenter<TWidget>
{
    render(widget: TWidget) : void;
}
export interface ILayoutPresenter {
    renderLayout(layout: ViewLayout,  pageShell: PageShell):Element;
}
export interface INotifiable
{
    onNotified(sender: any, args: Array<any>): void;
}
export interface ISplittableView
{

    onConnectViews(splitOwner: ISplittableView): void;
    onSplittedViewRequestExpand(send: FSView): void;
    onSplittedViewRequestShrink(send: FSView): void;
    onSplittedViewRequestClose(send: FSView): void;
    onSplittedViewDataReceive(dataScope: string, args: any, send: FSView): void;
    onSplittedViewDataRequest(dataScope: string, args: any, send: FSView): any;
}
export class NativeLib
{
    libName: string;
    hasCss: boolean;
    hasJs: boolean;

    private cssPath: string;
    private jsPath: string;

    constructor({ libName, cssPath = '', jsPath = '' }: 
            { 
                libName: string; 
                cssPath?: string; 
                jsPath?: string; 
            })
    {
        this.libName = libName;
        this.cssPath = cssPath;
        this.jsPath = jsPath;
        this.hasCss = (cssPath != '' && cssPath != null);
        this.hasJs = (jsPath != '' && jsPath != null);
    }

    getCssFullPath(): string
    {
        return `${PageShell.LIB_ROOT}${this.libName}/${this.cssPath}`;
    }

    getJsFullPath(): string
    {
        return `${PageShell.LIB_ROOT}${this.libName}/${this.jsPath}`;
    }

    public toString(): string
    {
        return this.libName;
    }
}
export class PageShell {

    /**defaults: '/lib/' */
    public static LIB_ROOT = '/lib/'

    private baseDocument: Document;
    private importedLibs: NativeLib[];
    private page: FSPage;

    
    private appContainer: HTMLDivElement;
    private splitContainer: HTMLDivElement;

    constructor(mainDocument: Document, fsPage: FSPage) 
    {
        this.baseDocument = mainDocument;
        this.importedLibs = [];
        this.page = fsPage;
    }


    public enableSplitting(appContainerId: string, splitContainerId: string): void
    {
        this.appContainer = this.elementById(appContainerId) as HTMLDivElement;
        this.splitContainer = this.elementById(splitContainerId) as HTMLDivElement;

        if(this.splitContainer == null)
            throw new Error(`enable split fail: container Id '${splitContainerId}' not found in document. An div tag with this Id maybe not present.`);

        this.splitContainer.style.width = '0 px';
        this.splitContainer.hidden = true;
    }

    private currentViewSplitted: boolean = false;

    public isViewSplitted() : boolean
    {
         return this.currentViewSplitted;
    }

    public shrinkSplitView(ownerSplitView: ISplittableView)
    {
        if (this.currentViewSplitted == false) return;

        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function ()
        {
            self.appContainer.classList.remove('col-6');
            self.appContainer.classList.add('col-9');

            self.splitContainer.classList.remove('col-6');
            self.splitContainer.classList.add('col-3');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
    }

    public expandSplitView(ownerSplitView: ISplittableView)
    {
        if (this.currentViewSplitted == false) return;

        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function ()
        {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-6');

            self.splitContainer.classList.remove(...self.splitContainer.classList);
            self.splitContainer.classList.add('col-6');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
    }

    public requestSplitView(ownerSplitView: ISplittableView, splittedCallingView: FSView)
    {
        if (this.currentViewSplitted) return;
 
        var self = this;
        this.splitContainer.hidden = false;
        var interv =   setInterval(function ()
        {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-9');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;

        self.splitContainer.style.borderLeft = '3px solid gray';
        this.navigateToView((splittedCallingView as unknown) as FSView);
        
        (splittedCallingView as unknown as ISplittableView).onConnectViews(ownerSplitView);
    }

    public closeSplitView()
    {
        if (this.currentViewSplitted == false) return;

        var self = this;
        this.splitContainer.innerHTML = '';
        this.splitContainer.hidden = true;
        var interv = setInterval(function ()
        {
            self.splitContainer.classList.remove(...self.splitContainer.classList);
            self.splitContainer.classList.add('col-3');

            self.appContainer.classList.remove(...self.appContainer.classList);
 
            self.appContainer.classList.add('col-12');
            clearInterval(interv);
        });
        this.currentViewSplitted = false;
    
    }

    public createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, innerText?: string)
    {
        var element = this.baseDocument.createElement(tagName);
        if(innerText != null)
           element.innerText = innerText;
        return element;
    }

    public navigateToView(view:FSView): void
    {
        this.page.navigateToView(view);
    }

    public getPageBody(): Element
    {
        return this.elementsByTagName('body')[0];
    }

    public elementsByTagName(tagName: string) : HTMLCollectionOf<Element> {
        return this.baseDocument.getElementsByTagName(tagName);
    }

    public elementById(elementId: string): Element {
        return this.baseDocument.getElementById(elementId);
    }

    public appendChildToElement(containerElement: Element, childElement: Element): Element {
        return containerElement.appendChild(childElement);
    }

    public removeChildFromElement(containerElement: Element, childElement: Element): Element {
        return containerElement.removeChild(childElement);
    }

    public getImportedLib(libName: string): NativeLib {
        if (this.importedLibs == undefined) return;
        for (var i = 0; i < this.importedLibs.length; i++)
            if (this.importedLibs[i].libName == libName)
                return this.importedLibs[i];
        return null;
    }

    public import(lib: NativeLib): void {
        var existing = this.getImportedLib(lib.libName);
        if (existing !== null)
            return;

        if (lib.hasCss) {
            var link: HTMLLinkElement = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = lib.getCssFullPath();

            document.head.appendChild(link);
        }

        if (lib.hasJs) {
            var jsImport: HTMLScriptElement = document.createElement('script');
            jsImport.src = lib.getJsFullPath();

            document.body.appendChild(jsImport);
        }

        this.importedLibs.push(lib);
    }
}
export class RowOptions
{
    rowHeidth?: string;
    rowClass?: string;

    columns?: Column[] = [];

    constructor()
    {
        this.rowClass = 'row';
    }
}


export class Row
{

    id: string;
    rowClass: string = 'row';
    rowWidth: string;
    rowHeidth: string;
    flexGrow1: boolean;
    rowColumns: Column[] = [];

    generatedColumnId: string;

    constructor(id: string, options: RowOptions)
    {
        this.id = id;

        if (Misc.isNullOrEmpty(options.rowClass) == false)
            this.rowClass = options.rowClass;
        if (Misc.isNullOrEmpty(options.rowHeidth) == false)
            this.rowHeidth = options.rowHeidth;
        if (Misc.isNull(options.columns) == false)
            this.rowColumns = options.columns;

        if ((this.rowColumns == null || this.rowColumns == undefined) || this.rowColumns.length == 0)
        {
            var id: string = `col_${FSWidget.generateUUID()}`;
            this.generatedColumnId = id;
            this.rowColumns = [
                new Column(id, { colClass: 'col-md-12 col-xs-12 col-lg-12 col-sm-12' })
            ];
        }
        else
        {
            for (var i = 0; i < this.rowColumns.length; i++)
            {
                var column: Column = this.rowColumns[i];
                if (Misc.isNullOrEmpty(column.colClass))
                    column.colClass = 'col-md-12 col-xs-12 col-lg-12 col-sm-12'
            }
        }
    }
}
export class Misc 
{
    public static isNull(value: any|object): boolean
    {
        return (value == null || value == undefined);
    }

    public static isNullOrEmpty(value: any|object): boolean
    {
        return (value == null || value == undefined || value == '');
    }
}
export class SelectOption
{
    public value: any;
    public text: string;

    constructor(opValue: any, opText: string)
    {
        this.value = opValue;
        this.text = opText;
    }
}
export class ViewDictionaryEntry 
{

    originalId : string;
    managedId : string;

    constructor(originalId : string, managedId : string) {
        this.originalId = originalId;
        this.managedId = managedId;
    }

    getOriginalId() {
        return this.originalId;
    }

    getManagedId() {
        return this.managedId;
    }
}
export class ViewLayout
{

    private layoutDOM: Document;
    public layoutRows: Row[];
    public containerDivObj: Element;
    private containerDivName: string;
    private shellPage: PageShell;
    private rawHtml: string;
    private fromString: boolean = false;

    private layoutPresenter: ILayoutPresenter = new DefaultLayoutPresenter();

    constructor(containerDivId: string, rows?: Row[])
    {
        this.layoutRows = rows;
        this.containerDivName = containerDivId;
    }

    public getRow(rowId: string): Row
    {
        if (this.fromString)
            throw new Error('getRow() is not supported when layout is output over raw html string');

        for (var i = 0; i < this.layoutRows.length; i++)
            if (this.layoutRows[i].id == rowId)
                return this.layoutRows[i];
        return null as unknown as Row;
    }

    fromHTML(rawHtmlLayoutString: string): ViewLayout
    {
        this.fromString = true;
        this.rawHtml = rawHtmlLayoutString;
        return this;
    }

    render(shellPage: PageShell, customPresenter?: ILayoutPresenter): Element
    {
        this.shellPage = shellPage;
        this.containerDivObj = shellPage.elementById(this.containerDivName);

        if (this.fromString)
        {
            var parser = new DOMParser();
            var dom: Document = parser.parseFromString(this.rawHtml, 'text/html');
            this.layoutDOM = dom;

            var objDom = this.layoutDOM.children[0].children[1];

            for (var i = 0; i < objDom.childNodes.length; i++)
                this.containerDivObj.appendChild(objDom.childNodes[i]);

            return objDom;
        }

        if (undefined == shellPage || null == shellPage)
            throw 'PageShell instance is required here.';
        if (undefined != customPresenter || null != customPresenter)
            this.layoutPresenter = customPresenter;

        return this.layoutPresenter.renderLayout(this, shellPage);
    }

    ElementsIdCollection(): string[]
    {
        if (this.fromString)
        {
            var idCollection: Array<string> = [];
            var nodesWithId: NodeListOf<Element> = this.containerDivObj.querySelectorAll('*[id]');
            for (var i = 0; i < nodesWithId.length; i++)
                idCollection.push(nodesWithId[i].id);
            return idCollection;
        }
        return this.ScanRows(this.layoutRows);
    }

    private ScanRows(rows: Row[]): string[]
    {
        var result: string[] = [];
        if (rows !== undefined)
        {
            for (var i = 0; i < rows.length; i++)
            {
                var row: Row = rows[i];
                result.push(row.id);

                if (row.rowColumns !== undefined)
                {
                    var cols: string[] = this.ScanColumns(row.rowColumns);
                    for (var c = 0; c < cols.length; c++)
                        result.push(cols[c]);
                }
            }
        }
        return result;
    }

    private ScanColumns(columns: Column[]): string[]
    {
        var result: string[] = [];
        for (var i = 0; i < columns.length; i++)
        {
            var col = columns[i];
            result.push(col.id);

            if (col.columnRows !== null)
            {
                var rows: string[] = this.ScanRows(col.columnRows);
                for (var r = 0; r < rows.length; r++)
                    result.push(rows[r]);
            }
        }
        return result;
    }
}
export class WidgetFragment implements INotifiable
{

    contextRoot: FSWidgetContext;
    fragmentId: string;
    containerElement: HTMLDivElement;
    widgets: FSWidget[];
    widgetsLoaded: number;

    /**
     * 
     * @param appContextRoot The parent WidgetContext
     * @param containerElement An (Element object) HTML element to compose the adjacent Widgets. Usually Div's.
     */
    constructor(appContextRoot: FSWidgetContext, containerElement: HTMLDivElement)
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
    findWidget(name: string): FSWidget
    {
        for (var i = 0; i < this.widgets.length; i++)
        {
            var widget: FSWidget = this.widgets[i];
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
    attatchWidget(widget: FSWidget)
    {
        for (var i = 0; i < this.widgets.length; i++)
        {
            var existingWidget: FSWidget = this.widgets[i];
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
    dettatchwidget(widget: FSWidget): void
    {
        var toRemove = -1;
        for (let index = 0; index < this.widgets.length; index++)
        {
            var existingWidget: FSWidget = this.widgets[index];
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
export class WidgetMessage {
    widgetName: string;
    messageId: number;
    messageText: string;
    messageAnyObject: object;
    
    constructor(widgetName : string, messageId : number, messageText : string, messageAnyObject : object) {
        this.widgetName = widgetName;
        this.messageId = messageId;
        this.messageText = messageText;
        this.messageAnyObject = messageAnyObject;
    }
}
export class PageJsFunction
{
    public functionName: string;
    public functionArgs: string[];
    public functionBodyContent: string;
    private keep: boolean;
    public functionId: string;

    public toString(): string
    {
        return `function ${this.functionName}(${this.argNamesStr()});`;
    }

    constructor({ fnName, fnArgNames = [], fnContent, keepAfterCalled = false }:
        {
            fnName: string,
            fnArgNames?: string[],
            fnContent?: string,
            keepAfterCalled?: boolean,
        })
    {
        this.functionName = fnName;
        this.keep = keepAfterCalled;
        this.functionArgs = fnArgNames;
        this.functionBodyContent = fnContent;
        this.functionId = FSWidget.generateUUID();
    }

    setContent(fnContent: string): PageJsFunction
    {
        this.functionBodyContent = fnContent;
        return this;
    }

    call(...argValues: string[]) : void
    {
        var argNamesStr = this.argNamesStr();
        var argValuesStr = this.argValuesStr(...argValues);

        var fnString = `function ${this.functionName}(${argNamesStr}) {
            ${this.functionBodyContent}
        }
        
        ${this.functionName}(${argValuesStr});`;

        var fn = document.createElement('script');
        fn.id = this.functionId;
        fn.textContent = fnString;

        var els = document.getElementsByTagName('body');
        els[0].append(fn);

        if(this.keep == false)
          fn.remove();
    }

    private argValuesStr(...argValues: string[]) : string
    {
        var argValuesStr = '';
        for (var a = 0; a < argValues.length; a++)
            argValuesStr += `'${argValues[a]}', `;
        if (argValuesStr.endsWith(', '))
            argValuesStr = argValuesStr.substring(0, argValuesStr.length - 2);
        return argValuesStr;
    }

    private argNamesStr(): string
    {
        var argNamesStr = '';
        for (var a = 0; a < this.functionArgs.length; a++)
            argNamesStr += `${this.functionArgs[a]}, `;
        if (argNamesStr.endsWith(', '))
            argNamesStr = argNamesStr.substring(0, argNamesStr.length - 2);
        return argNamesStr;
    }
}
export class DefaultExceptionPage
{
    constructor(error: Error)
    {
        if(FSPage.DISABLE_EXCEPTION_PAGE)
            return;
            
        var errorsStr = `${error.stack}`.split('\n');
        var title = error.message;
        var paneId = FSWidget.generateUUID();
        var rawHtml = `<div id="exceptionPane_${paneId}">`;
        rawHtml += `<img style="padding-left:30px; padding-top: 80px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAHYAAAB2AH6XKZyAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABFZJREFUeJztm0GLFEcUx/+vpzurQhaVCKJB/QSehJwjgrCzB4egm4PsIcJOEslNkNw8GQQ9Rp0h5GhcJQ4kuKeQfAEvCehRHNwNaxDUJbqZme56Ocz2Tk93VXXPdndZ7PaD3enueq/q/V6/elU9vQtUUkkllVSyc4VUDVfX/FlitFjgEBgIf1hEjll2zGM6Sj0xfh08/FDZAZvnK4KpefUT92ERAXBUDZbCA4zDDvPtIuC1AbAUPmz/uPQAWAy/2WYkAFbCmwrAdocH9DXAWng2OgVshDc2BWyFNxEAq+HfzxSwB95YDbAW3uwU2L7wQOoUsBTezBSwF95IDbAa3kwGyJ20At5kALYzPLCVnaAN8CYywGb4IpMg+xSwCd5EBuwEeCDLFLAR3lQGbHd4AHCVLebg/2OgVRN8p+d7j6+fprfFIupFGQBD8MsUiPp3p6b+Kh4tm6gzwMCdF8yz194jPJBlGYwcFznnGWhdO/nBnyUwTSTaDCiz4NUE34kO9+1v/iwLbjE23khhpJsshKxpi10XtAKm5vXP5O8S1ctgifBgwHO8J2PjlQE//HUYpH6XOPHTYBHwzMCVT+nf2HDFw4fXwMp3iRM9DRYFP3IsNp4KJOx4S/B6yfw0GPpQCLzKuYiuAH4PhHuMAvcohFhKh+elAP4RDoJjzPhD2q9Esu0DDMMzACHcL27UqQsAC4/4zL5Vf5GZG3J46rx54c21mzQAgEu/rF+AX3uaBg9kqQFlwGuCEAK6YqTVPkGDVwfdOQZ15PDuJjwAuMFGa4ZpoA+ADi4HvNSvWGoz9W8tPGIvbG6foMGbv905cDQISfiFFns+nO/z14Ay4SXOjac2A6CZvav9zjdLPBXqtJs0eNZzzxJwlwU9kMFPH/AXIWgm2fmEATD+PB+FH93h+q7A/2mhNcqE++coeL3qza/9434uhWduZIUHit4HQK6vrNyJMVliw429h5KZUAQ8UOQ+AHL9fPAbp4Lquwf9n6NBCCUPPFDUPkChr4SXOZdiI4TT6z2HiJu92gcB5p60r/A0dw2In+eEV/qjsGFBD+JzPpT75yjoBt55AHfHxolyaCTfPgDYGrwiA+Q21JEVvHhhXHvpzUNQZ6zL3DUAhuAht9EtddMfJQtjl92zoGEmZIEHtroPAPLBy7yL2RDzQ/1SR/Wp9eQSufbSm2fmzH9HPPk+AMgPr7o7ERsfwVfpSx03pvf7i9EgtJs0gCMuSvuVyGT7AMAIfFxFu9RRMgjSfhWS+qVoKfCaIIQ2DtwfL99bv+DXQOT0b2q3t8SND/f3O5fvrX/t10AIaj+ANONERP+dYEnwUr+iNkOFU4Fb6xKAxOof62BYUqjuU60LAWSFB7LUgNC5IuFVNZAlbSnn0mqf1kdEdDVgJTQuA/7Kr7xnbDxBKyXCP5doAtD+xwg1wVgu5c4z8I4Hx8cdpSZAyykgo9PM8LTMcL6UaFdSSSWVVLLj5X+IDiuFkg1oQQAAAABJRU5ErkJggg==" />`;
        rawHtml += `<h4 style="padding-left:30px"> ${title} </h4>`;
        rawHtml += `<p style="padding-left:30px; font-size: 20px">`;
        for (var i = 0; i < errorsStr.length; i++)
        {
            var erro = errorsStr[i];
            var msg = erro.trim();

            if (msg.indexOf('at') == 0)
            {
                var codePath = msg.substring(3, msg.indexOf('('));
                codePath = codePath.trim();
                msg = msg.replace(codePath,
                    `<span class="badge badge-secondary"> ${codePath} </span>`);
            }

            rawHtml += `${msg} <br/>`;
        }

        rawHtml += `</p>
            <button type="button" onclick="document.getElementById('exceptionPane_${paneId}').remove()" style="margin-left:30px; margin-bottom: 30px" class="btn btn-warning"> Hide </button>
        </div>
        `;
        
        var c = new DOMParser().parseFromString(rawHtml, 'text/html').body;
        document.body.prepend(c);
    }
}
export class FSHeadBinder extends WidgetBinder
{
    private head: FSHead;
    constructor(head: FSHead)
    {
        super(head);
        this.head = head;
    }

    getWidgetValue()
    {
        return this.head.value();
    }
    refreshUI(): void
    {
        var propValue = this.getModelPropertyValue();
        this.head.setText(`${propValue}`);
    }
    fillPropertyModel(): void { }
}

export class FSHead extends FSWidget implements IBindable
{
    private headType: string;
    private textContent: string;
    private headElement: HTMLHeadElement;
    constructor({ name, headType, text }:
        {
            name: string,
            headType: string,
            text: string
        })
    {
        super(name);

        if (headType == '' || headType == null || headType == undefined)
            headType = 'H1';

        this.textContent = text;
        this.headType = headType
            .replace('<', '')
            .replace('/', '')
            .replace('>', '');
    }
    getBinder(): WidgetBinder
    {
        return new FSHeadBinder(this);
    }
    protected htmlTemplate(): string
    {
        return `<${this.headType} id="fsHead"> </${this.headType}>`
    }
    protected onWidgetDidLoad(): void
    {
        this.headElement = this.elementById('fsHead');
        this.headElement.textContent = this.textContent;
    }

    public setCustomPresenter(presenter: ICustomWidgetPresenter<FSWidget>): void
    {
        presenter.render(this);
    }

    public setText(text: string): void
    {
        this.headElement.textContent = text;
    }

    public value(): string
    {
        return this.headElement.textContent;
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.headElement.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.headElement.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.headElement.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.headElement.style.position = position;
        this.headElement.style.left = marginLeft;
        this.headElement.style.top = marginTop;
        this.headElement.style.right = `${marginRight}`;
        this.headElement.style.bottom = `${marginBottom}`;
        this.headElement.style.transform = `${transform}`;
    }
    public setVisible(visible: boolean): void
    {
        this.headElement.hidden = (visible == false);
    }

}
export class ModalAction
{
    public text: string;
    public classes: string[];
    public onClick?: Function;
    public dismis: boolean;

    constructor(buttonText: string, dataDismiss: boolean, buttonClick?: Function, ...buttonClasses: string[])
    {
        this.text = buttonText;
        this.classes = buttonClasses;
        this.onClick = buttonClick;
        this.dismis = dataDismiss;

        if (this.text == null)
            this.text = 'Modal action';
        if (this.classes == null || this.classes.length == 0)
            this.classes = ['btn', 'btn-primary'];
    }

    public setButton(button: HTMLButtonElement, modal: FSModalView)
    {
        var self = this;
        if (Misc.isNull(this.onClick) == false)
            button.onclick = function ()
            {
                self.onClick(modal);
            };
    }
}
export class RadioOption
{
    public optionContainer: HTMLDivElement;
    public radioInput: HTMLInputElement;
    public radioLabel: HTMLLabelElement;

    constructor(text: string,
        value: string, fieldSetId: string, shell: PageShell)
    {
        var template: FSTemplateView = new FSTemplateView(
            `<div id="radioOptionContainer" style="margin-right: 10px" class="custom-control custom-radio">
    <input id="radioInput" type="radio" name="fieldset" class="custom-control-input">
    <label id="radioLabel" class="custom-control-label font-weight-normal" for=""> Radio Option </label>
</div>
`,
            shell);

        this.optionContainer = template.elementById('radioOptionContainer');
        this.radioInput = template.elementById('radioInput');
        this.radioLabel = template.elementById('radioLabel');

        this.radioLabel.textContent = text;
        this.radioInput.value = value;
        this.radioInput.name = fieldSetId;
        this.radioLabel.htmlFor = this.radioInput.id;
    }

    isChecked(): boolean
    {
        return this.radioInput.checked;
    }

    value(): string
    {
        return this.radioInput.value;
    }

    setChecked(isChecked: boolean): void
    {
        this.radioInput.checked = isChecked;
    }

    setEnabled(isEnabled: boolean): void
    {
        this.radioInput.disabled = (isEnabled == false);
    }
}

export class FSRadioGroupBinder extends WidgetBinder
{
    private radioGp: FSRadioGroup;
    constructor(radioGroup: FSRadioGroup)
    {
        super(radioGroup);
        this.radioGp = radioGroup;
    }

    getWidgetValue()
    {
        return this.radioGp.value();
    }
    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.radioGp.setValue(value);
    }
    fillPropertyModel(): void
    {
        var value = this.getWidgetValue();
        this.setModelPropertyValue(value);
    }

}

export class FSRadioGroup extends FSWidget implements IBindable
{
    public groupContainer: HTMLDivElement;
    public groupTitle: HTMLLabelElement;
    public fieldSet: HTMLFieldSetElement;


    private options: Array<RadioOption> = [];
    private title: string;
    private orientation: string;

    private initialOptions: Array<any> = [];

    /**
    * 
    * @param direction Flex direction: 'column' / 'row'
    * @param options array { t:'Option Text', v: 'option_value' }
    */
    constructor({ name, title = '', orientation = 'vertical', options = [] }:
        {
            name: string,
            title?: string,
            orientation?: string,
            options?: Array<any>
        })
    {
        super(name);

        this.title = title;
        this.orientation = orientation;
        this.initialOptions = options;
    }
    getBinder(): WidgetBinder
    {
        return new FSRadioGroupBinder(this);
    }

    protected onWidgetDidLoad(): void
    {
        this.groupContainer = this.elementById('fsRadioGroup');
        this.groupTitle = this.elementById('groupTitle');
        this.fieldSet = this.elementById('fieldSet');

        this.groupTitle.textContent = this.title;

        if (this.orientation != 'horizontal' && this.orientation != 'vertical')
            throw new Error(`Invalid value '${orientation}' for 'orientation' parmeter. Accepted values are 'vertical' or 'horizontal'`);

        if (this.orientation == 'vertical')
            this.fieldSet.classList.add(`flex-column`);
        if (this.orientation == 'horizontal')
            this.fieldSet.classList.add(`flex-row`);

        this.addOptions(this.initialOptions);
    }

    protected htmlTemplate(): string
    {
        return `
<div id="fsRadioGroup">
  <label id="groupTitle" class="font-weight-normal" style="margin-left: 3px"> </label>
  <fieldset class="d-flex" id="fieldSet">

  </fieldset>
</div>`;
    }

    /**
     * 
     * @param options  array { t:'Option Text', v: 'option_value' }
     */
    addOptions(options: Array<any>)
    {
        for (var i = 0; i < options.length; i++)
        {
            var op = options[i];
            this.addOption(op.t, op.v);
        }
    }

    addOption(text: string, value: string)
    {
        var newOpt: RadioOption = new RadioOption(
            text,
            value,
            this.fieldSet.id,
            this.getPageShell()
        );
        this.options.push(newOpt);
        this.fieldSet.appendChild(newOpt.optionContainer);
    }

    fromList(models: Array<any>, textKey: string, valueKey: string)
    {
        for (var i = 0; i < models.length; i++)
        {
            var model = models[i];
            var text = model[textKey];
            var value = model[valueKey];
            this.addOption(text, value);
        }
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }

    public selectedOption(): RadioOption
    {
        for (var i = 0; i < this.options.length; i++)
            if (this.options[i].isChecked())
                return this.options[i];
    }

    public setValue(value: string): void
    {
        for (var i = 0; i < this.options.length; i++)
        {
            if (this.options[i].value() == value)
                this.options[i].setChecked(true);
            else
                this.options[i].setChecked(false);
        }
    }

    public value(): string
    {
        for (var i = 0; i < this.options.length; i++)
        {
            var op = this.options[i];
            if (op.isChecked())
                return op.value();
        }
        return '';
    }
    public setEnabled(enabled: boolean): void
    {
        for (var i = 0; i < this.options.length; i++)
        {
            var op = this.options[i];
            op.setEnabled(enabled);
        }
    }

    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.groupContainer.style.position = position;
        this.groupContainer.style.left = marginLeft;
        this.groupContainer.style.top = marginTop;
        this.groupContainer.style.right = marginRight;
        this.groupContainer.style.bottom = marginBottom;
        this.groupContainer.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.groupContainer.hidden = (visible == false);
    }

}
export class FSButton extends FSWidget
{
    public buttonElement: HTMLButtonElement;
    public imageElement: HTMLImageElement;

    private text: string;
    public onClick: Function;
    private btnClass: string;
    private imageSrc: string;
    private imageWidth: number;

    constructor({ name, text, imageSrc, imageWidth, btnClass = 'btn-light' }:
        {
            name: string;
            text: string;
            imageSrc?: string;
            imageWidth?: number,
            btnClass?: string
        })
    {
        super(name);

        this.imageSrc = imageSrc;
        this.imageWidth = imageWidth;
        this.text = text;
        this.btnClass = btnClass;
    }

    protected htmlTemplate(): string
    {
        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined)
        {
            return `
<button id="fsButton" type="button" style="height: 35px" class="btn btn-block"> 
     <img alt="img" id="fsButtonImage" src="/icons/sb_menu.png" width="20" ></img> 
</button>`
        }
        else
            return `<button id="fsButton" type="button" style="height: 35px" class="btn btn-block">Button</button>`
    }
    protected onWidgetDidLoad(): void
    {
        var self = this;
        this.buttonElement = this.elementById('fsButton');
        this.buttonElement.classList.add(this.btnClass);
        this.imageElement = this.elementById('fsButtonImage');

        this.setText(this.text);
        
        if (self.onClick != null)
        {
            this.buttonElement.onclick = function (ev)
            {
                self.onClick(ev);
            };
        }
    }

    public setText(text: string)
    {
        this.buttonElement.innerText = text;

        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined)
        {
            this.imageElement.src = this.imageSrc;
            this.imageElement.width = this.imageWidth;
            this.buttonElement.appendChild(this.imageElement);
        }
    }

    public value(): string
    {
        throw new Error("Button does not support value");
    }

    public setVisible(visible: boolean): void
    {
        this.buttonElement.hidden = (visible == false);
    }

    public setEnabled(enabled: boolean): void
    {
        this.buttonElement.disabled = (enabled == false);
    }

    public addCSSClass(className: string): void
    {
        this.buttonElement.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.buttonElement.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.buttonElement.style.setProperty(propertyName, propertyValue);
    }

    public setPosition(position: string,
        marginLeft: string,
        marginTop: string,
        marginRight?: string,
        marginBottom?: string,
        transform?: string): void
    {
        this.buttonElement.style.position = position;
        this.buttonElement.style.left = marginLeft;
        this.buttonElement.style.top = marginTop;
        this.buttonElement.style.right = `${marginRight}`;
        this.buttonElement.style.bottom = `${marginBottom}`;
        this.buttonElement.style.transform = `${transform}`;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSButton>): void
    {
        renderer.render(this);
    }
}
export class FSCheckBoxBinder extends WidgetBinder
{
    private checkBox: FSCheckBox;
    constructor(checkBox: FSCheckBox)
    {
        super(checkBox);
        this.checkBox = checkBox;
    }

    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.checkBox.setChecked(value);
    }
    fillPropertyModel(): void
    {
        var checked: boolean = this.checkBox.isChecked();
        this.setModelPropertyValue(checked);
    }
    getWidgetValue()
    {
        var checked: boolean = this.checkBox.isChecked();
        return checked;
    }
}

export class FSCheckBox extends FSWidget implements IBindable
{
    public divContainer: HTMLDivElement;
    public checkElement: HTMLInputElement;
    public checkLabel: HTMLLabelElement;
    public onCheckedChange: Function;


    private labelText: string;
    constructor({name, text }:
        { name: string; text: string; })
    {
        super(name);

        this.labelText = text;
    }
    getBinder(): WidgetBinder
    {
        return new FSCheckBoxBinder(this);
    }

    protected htmlTemplate(): string
    {
        return `
<div id="fsCheckBox" class="custom-control custom-checkbox">
  <input id="checkElement" class="custom-control-input" type="checkbox" value="">
  <label id="checkLabel" class="custom-control-label font-weight-normal" for="checkElement">
    Default checkbox
  </label>
</div>`
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;
        self.divContainer = self.elementById('fsCheckBox');
        self.checkElement = self.elementById('checkElement');
        self.checkLabel = self.elementById('checkLabel');
        self.checkLabel.htmlFor = self.checkElement.id;
        self.checkLabel.textContent = self.labelText;

        self.checkElement.onchange = function(ev)
        {
            if(self.onCheckedChange != null) self.onCheckedChange({checked: self.checkElement.checked, event: ev});
        };
    }

    public setText(text:string): void
    {
        this.labelText = text;
        this.checkLabel.textContent = this.labelText;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return this.checkElement.checked.toString();
    }
    public setEnabled(enabled: boolean): void
    {
        this.checkElement.disabled = (enabled == false);
    }
    public addCSSClass(className: string): void
    {
        this.checkElement.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.checkElement.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.checkElement.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, 
        marginLeft: string,
        marginTop: string, 
        marginRight: string, 
        marginBottom: string, 
        transform?: string): void
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = `${transform}`;
    }

    public setVisible(visible: boolean): void
    {
       this.divContainer.hidden = (visible == false);
    }
    
    public setChecked(isChecked: boolean): void
    {
        this.checkElement.checked = isChecked;
    }
    public isChecked(): boolean
    {
        return this.checkElement.checked;
    }
}
export class FSImageViewBinder extends WidgetBinder
{
    private img: FSImageView;
    constructor(image: FSImageView)
    {
        super(image);
        this.img = image;
    }
    getWidgetValue()
    {
       return this.img.value();
    }
    refreshUI(): void
    {
       var valueModel = this.getModelPropertyValue();
       this.img.setSource(valueModel);
    }
    fillPropertyModel(): void { }
}

export class FSImageView extends FSWidget implements IBindable
{
    public image: HTMLImageElement;
    
    private imgSrc:string;
    private imgAlt:string;
    private imgCssClass: string;

    constructor({name, src, cssClass, alt}: 
        {
          name: string, 
          src?: string, 
          cssClass?:string, 
          alt?: string
        })
    {
        super(name);

        if(cssClass == null)
           cssClass = 'img-fluid'
        
        this.imgCssClass = cssClass;
        this.imgSrc = src;
        this.imgAlt = `${alt}`;
    }
    getBinder(): WidgetBinder
    {
        return new FSImageViewBinder(this);
    }

    protected htmlTemplate(): string
    {
        return `<img id="fsImageView" src="" class="img-fluid" alt="">`;
    }

    protected onWidgetDidLoad(): void
    {
        this.image = this.elementById('fsImageView');
        this.image.alt = this.imgAlt;
        this.setSource(this.imgSrc);
        this.addCSSClass(this.imgCssClass);
    }

    public setSource(imgSource: string)
    {
        this.imgSrc = imgSource;
        this.image.src = this.imgSrc;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return this.imgSrc;
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.image.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.image.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.image.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.image.style.position = position;
        this.image.style.left = marginLeft;
        this.image.style.top = marginTop;
        this.image.style.right = marginRight;
        this.image.style.bottom = marginBottom;
        this.image.style.transform = `${transform}`;
    }
    public setVisible(visible: boolean): void
    {
        this.image.hidden = (visible == false);
    }
}
export class FSLabelBinder extends WidgetBinder
{
    private label: FSLabel;
    constructor(label: FSLabel)
    {
        super(label);
        this.label = label;
    }

    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.label.setText(`${value}`);
    }
    fillPropertyModel(): void
    {
        var text: string = this.label.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue()
    {
        var text: string = this.label.getText();
        return text;
    }
}

export class FSLabel extends FSWidget implements IBindable
{
    public label: HTMLLabelElement;
    private lblText: string;
    constructor({name, text}:
        {name: string, text: string})
    {
        super(name);
        this.lblText = text;
    }
    getBinder(): WidgetBinder
    {
        return new FSLabelBinder(this);
    }
    protected htmlTemplate(): string
    {
        return `<label id="fsLabel" class="label"> Default label </label>`;
    }

    protected onWidgetDidLoad(): void
    {
        this.label = this.elementById('fsLabel');
        this.label.textContent = this.lblText;
    }

    public getText(): string
    {
        return this.value();
    }

    public setText(text: string): void
    {
        this.label.textContent = text;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return `${this.label.textContent}`;
    }

    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.label.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.label.classList.add(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.label.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.label.style.position = position;
        this.label.style.left = marginLeft;
        this.label.style.top = marginTop;
        this.label.style.right = marginRight;
        this.label.style.bottom = marginBottom;
        this.label.style.transform = `${transform}`;
    }
    public setVisible(visible: boolean): void
    {
        this.label.hidden = (visible == false);
    }
}
export class FSListViewBinder extends WidgetBinder
{
    private listView: FSListView;
    constructor(listView: FSListView)
    {
        super(listView);
        this.listView = listView;
    }
    refreshUI(): void
    {
        var viewModels: Array<any> = this.getModelPropertyValue();
        this.listView.fromList(viewModels, this.valueProperty, this.displayProperty);
    }
    getWidgetValue()
    {
        var item = this.listView.selectedItem();
        if (item == null) return null;
        return item.value;
    }
    fillPropertyModel(): void { }
}

export class FSListView extends FSWidget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="fsListView" class="list-group">
</div>`
    }
    public items: Array<IListItemTemplate> = [];
    public divContainer: HTMLDivElement;

    private itemClickedCallback: Function;

    private templateProvider: IListItemTemplateProvider;

    /**
     * 
     * @param itemClicked Function to handle onClick item event. 
     * 
     * Parameters: **(item: IListItemTemplate, ev: Event)**
     */
    constructor({ name, itemClicked = null, templateProvider = null }:
        {
            name: string;
            itemClicked?: Function,
            templateProvider?: IListItemTemplateProvider
        })
    {
        super(name);

        this.templateProvider = templateProvider;
        this.itemClickedCallback = itemClicked;
    }

    public itemTemplateProvider(): IListItemTemplateProvider
    {
        return this.templateProvider;
    }

    getBinder(): WidgetBinder
    {
        return new FSListViewBinder(this);
    }

    public fromList(viewModels: Array<any>, valueProperty?: string, displayProperty?: string): void
    {
        if (viewModels == null || viewModels == undefined) return;
        this.divContainer.innerHTML = '';
        for (var i = 0; i < viewModels.length; i++)
        {
            var viewModel: any | object = viewModels[i];
            var text = (displayProperty == null ? `${viewModel}` : viewModel[displayProperty]);
            var value = (valueProperty == null ? `${viewModel}` : viewModel[valueProperty]);

            if (this.itemTemplateProvider() == null)
            {
                var defaultItemTemplate = new ListItem(
                    `${i+1}`,
                    text,
                    value);

                this.addItem(defaultItemTemplate);
            }
            else
            {
                var templateProvider = this.itemTemplateProvider();
                var customItem = templateProvider.getListItemTemplate(this, viewModel);
                this.addItem(customItem);
            }
        }
    }

    protected onWidgetDidLoad(): void
    {
        this.divContainer = this.elementById('fsListView');
    }

    public onItemClicked(item: IListItemTemplate, ev: Event): void
    {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
        if (this.itemClickedCallback != null && this.itemClickedCallback != undefined)
            this.itemClickedCallback(item, ev);
    }

    public addItem(item: IListItemTemplate): FSListView
    {
        item.setOwnerList(this);
        this.items.push(item);
        var view: HTMLAnchorElement = item.itemTemplate();
        this.divContainer.append(view);
        return this;
    }

    public removeItem(item: IListItemTemplate): void
    {
        for (var i = 0; i < this.divContainer.children.length; i++)
        {
            var view: HTMLAnchorElement = this.divContainer.children[i] as HTMLAnchorElement;
            if (view.id == item.itemName)
            {
                var indx = this.items.indexOf(item);
                if (indx >= 0) this.items.splice(indx, 1);

                this.divContainer.removeChild(view);
                item = null;
                return;
            }
        }
    }

    public setSelectedValue(itemValue: any): void
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.value == itemValue)
                item.select();
            else
                item.unSelect();
        }
    }

    public setSelectedItem(selectedItem: IListItemTemplate): void
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            item.unSelect();
        }
        selectedItem.select();
    }

    public selectedItem(): IListItemTemplate
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.isSelected())
                return item;
        }
        return null;
    }
    public selectedValue(): any | object
    {
        var sItem = this.selectedItem();
        if (sItem == null || sItem == undefined) return null;
        return sItem.value;
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return this.selectedValue();
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.divContainer.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.divContainer.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.divContainer.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.divContainer.hidden = (visible == false);
    }
}
export class FSModalView extends FSWidget implements INotifiable
{
    public static $: FSModalView;

    private showFunction: PageJsFunction;

    public contentTemplate: FSTemplateView;
    private modalActions: ModalAction[] = [];
    private titleText: string;

    public modalContainer: HTMLDivElement;
    public titleElement: HTMLHeadElement;
    public bodyContainer: HTMLDivElement;
    public footerContainer: HTMLDivElement;

    private shell: PageShell;

    private modalContext: FSWidgetContext;

    constructor({ shell, name, title, contentTemplate, actions }:
        {
            shell: PageShell,
            name: string;
            title: string;
            contentTemplate: FSTemplateView;
            actions: ModalAction[];
        })
    {
        super(name);

        this.shell = shell;
        this.titleText = title;
        this.contentTemplate = contentTemplate;
        this.modalActions = actions;

        var body: Element = shell.getPageBody();
        var modalDivContainer: Element = shell.elementById('modalContainer');
        if (modalDivContainer == null)
        {
            modalDivContainer = shell.createElement('div');
            modalDivContainer.id = 'modalContainer';
            body.appendChild(modalDivContainer);
        }

        this.modalContext = new FSWidgetContext(
            shell,
            [modalDivContainer.id],
            null);

    }

    protected htmlTemplate(): string
    {
        return `
 <div id="fsModalView" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">        
        <div class="modal-content">
            <div class="modal-header">
                <h5 id="modalTitle" class="modal-title" id="exampleModalLongTitle">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            
            <div id="modalBody" class="modal-body">
                
            </div>

            <div id="modalFooter" class="modal-footer">
        
            </div>
        </div>
    </div>
  </div>`;

    }

    protected onWidgetDidLoad(): void
    {
        var self = this;
        self.titleElement = self.elementById('modalTitle');
        self.bodyContainer = self.elementById('modalBody');
        self.footerContainer = self.elementById('modalFooter');
        self.titleElement.textContent = self.titleText;
        self.modalContainer = self.elementById('fsModalView');
        self.bodyContainer.appendChild(self.contentTemplate.content());


        for (var i = 0; i < self.modalActions.length; i++)
        {
            const action: ModalAction = self.modalActions[i];
            const btn: HTMLButtonElement = self.shell.createElement('button');
            btn.type = 'button';
            btn.id = `modalAction_${FSWidget.generateUUID()}`;
            btn.textContent = action.text;

            for (var c = 0; c < action.classes.length; c++)
                btn.classList.add(action.classes[c]);

            action.setButton(btn, this);
            if (action.dismis)
                btn.setAttribute('data-dismiss', 'modal');

            self.footerContainer.appendChild(btn);
        }

        self.showFunction = new PageJsFunction({
            fnName: 'modalShow',
            fnArgNames: [],
            keepAfterCalled: true
        })

        self.showFunction.setContent(`
            var md = new bootstrap.Modal(document.getElementById('${self.modalContainer.id}'), { backdrop: false })
            md.show();
            $('#${self.modalContainer.id}').on('hidden.bs.modal', function (e) {
                document.getElementById('${self.modalContainer.id}').remove();
                document.getElementById('${self.showFunction.functionId}').remove();
            })`);


        self.showFunction.call();
    }

    public show(): void
    {
        this.modalContext.addWidget('modalContainer', this);
        this.modalContext.build(this, false);
        FSModalView.$ = this;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }

}
export class FSNavBar extends FSWidget
{

    public navBar: HTMLDivElement;
    public leftLinks: HTMLUListElement;
    public rightLinks: HTMLUListElement;
    public brandText: HTMLAnchorElement;
    public pushMenuButton: HTMLAnchorElement;

    constructor(name: string)
    {
        super(name);
    }

    protected htmlTemplate(): string
    {
        return `
<nav id="fsNavbar" class="navbar fixed-top">
  
    <!-- Left navbar links -->
    <ul id="navLeftLinks" class="navbar-nav">
        <li class="nav-item">
           <a id="btnPushMenu" class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
       
     
    </ul>

   <a id="brandText" class="navbar-brand">My First App</a>

    <!-- Right navbar links -->
    <ul id="navRightLinks" class="navbar-nav ml-auto">
    </ul>
</nav>`
    }

    onWidgetDidLoad(): void
    {
        this.navBar = this.elementById('fsNavbar');
        this.leftLinks = this.elementById('navLeftLinks')
        this.rightLinks = this.elementById('navRightLinks')
        this.brandText = this.elementById('brandText');
        this.pushMenuButton = this.elementById('btnPushMenu');

        this.pushMenuButton.style.marginLeft = '5px';
        this.brandText.style.marginLeft = '10px';
        this.navBar.style.boxShadow = '0 0 1em lightgray';
    }

    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.navBar.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.navBar.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.navBar.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.navBar.style.position = position;
        this.navBar.style.left = marginLeft;
        this.navBar.style.top = marginTop;
        this.navBar.style.right = marginRight;
        this.navBar.style.bottom = marginBottom;
        this.navBar.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.navBar.hidden = (visible == false);
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }


}
export class FSProgressBar extends FSWidget
{
    protected onWidgetDidLoad(): void
    {
        throw new Error("Method not implemented.");
    }
    protected htmlTemplate(): string
    {
        throw new Error("Method not implemented.");
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    
}
export class FSSelectBinder extends WidgetBinder
{
    private select: FSSelect;
    constructor(select: FSSelect)
    {
        super(select);
        this.select = select;
    }
    getWidgetValue()
    {
        return this.select.value();
    }
    refreshUI(): void
    {
        var models: Array<any | object> = this.getModelPropertyValue();
        if (this.bindingHasPath)
            this.select.fromList(models, this.valueProperty, this.displayProperty);
        else
            this.select.fromList(models);
    }
    fillPropertyModel(): void { }
}

export class FSSelect extends FSWidget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="fsSelect" class="form-group">
    <label id="selectTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="selectEl"> Select Title </label>
    <select style="height: 35px" id="selectEl" class="form-control">
    </select>
</div>`
    }

    private divContainer: HTMLDivElement = null;
    private title: HTMLLabelElement = null;
    private select: HTMLSelectElement = null;
    public onSelectionChanged: Function = null;

    constructor({ name }:
        { name: string; })
    {
        super(name);
    }
    getBinder(): WidgetBinder
    {
        return new FSSelectBinder(this);;
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;

        this.divContainer = this.elementById('fsSelect');
        this.title = this.elementById('selectTitle');
        this.select = this.elementById('selectEl');

        this.select.onchange = function (ev)
        {
            if (self.onSelectionChanged != null)
                self.onSelectionChanged(ev);
        };

    }
    public setSelectedOption(optionValue: any): void
    {
        try
        {
            for (var i = 0; i < this.select.options.length; i++)
                this.select.options[i].selected = false;

            for (var i = 0; i < this.select.options.length; i++)
            {
                var option = this.select.options[i];

                if (option.value == optionValue)
                {
                    option.selected = true;
                    return;
                }
            }
        } catch (error)
        {
            this.processError(error);
        }
    }

    public fromList(models: Array<any>,
        valueProperty?: string,
        displayProperty?: string): void
    {
        if(models == null || models == undefined) return;
        try
        {
            var optionsFromModels: Array<SelectOption> = [];
            for (var i = 0; i < models.length; i++)
            {
                var model = models[i];
                var option: SelectOption = null;

                if (valueProperty != null && valueProperty != undefined)
                    option = new SelectOption(model[valueProperty], model[displayProperty])
                else
                    option = new SelectOption(`${models[i]}`, `${models[i]}`);

                optionsFromModels.push(option);
            }
            this.addOptions(optionsFromModels);
        }
        catch (error)
        {
            this.processError(error);
        }
    }

    public addOptions(options: Array<SelectOption>): void
    {
        this.select.innerHTML = '';
        for (var i = 0; i < options.length; i++)
            this.addOption(options[i]);
    }

    public addOption(option: SelectOption): FSSelect
    {
        try
        {
            var optionEL: HTMLOptionElement = document.createElement('option');
            optionEL.value = option.value;
            optionEL.textContent = option.text;
            this.select.add(optionEL);
            return this;
        }
        catch (error)
        {
            this.processError(error);
        }
    }

    public setTitle(title: string): void
    {
        this.title.textContent = title;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        try
        {
            renderer.render(this);
        }
        catch (error)
        {
            this.processError(error);
        }
    }

    public value(): string
    {
        return this.select.value;
    }
    public addCSSClass(className: string): void
    {
        this.select.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.select.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.select.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.divContainer.hidden = (visible == false);
    }

    public setEnabled(enabled: boolean): void
    {
        this.select.disabled = (enabled == false);
    }
}
export class FSSpinner extends FSWidget
{
    protected onWidgetDidLoad(): void
    {
        throw new Error("Method not implemented.");
    }
    protected htmlTemplate(): string
    {
        throw new Error("Method not implemented.");
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    
}
export class FSSwitcher extends FSWidget
{
    protected onWidgetDidLoad(): void
    {
        throw new Error("Method not implemented.");
    }
    protected htmlTemplate(): string
    {
        throw new Error("Method not implemented.");
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }

}
export class Mask
{
    /** 00/00/0000 */
    public static DATE: string = '00/00/0000';

    /**00:00:00 */
    public static TIME: string = '00:00:00';

    /**00/00/0000 00:00:00 */
    public static DATE_TIME: string = '00/00/0000 00:00:00';

    /**00000-000 */
    public static CEP: string = '00000-000';

    /**0000-0000 */
    public static PHONE: string = '0000-0000';

    /** (00) 0000-0000*/
    public static PHONE_DDD: string = '(00) 0000-0000';

    /**(000) 000-0000 */
    public static PHONE_US: string = '(000) 000-0000';

    /**000.000.000-00 */
    public static CPF: string = '000.000.000-00';

    /**00.000.000/0000-00 */
    public static CNPJ: string = '00.000.000/0000-00';

    /**000.000.000.000.000,00 */
    public static MONEY: string = '000.000.000.000.000,00';

    /**#.##0,00 */
    public static MONEY2: string = '#.##0,00';

    /**099.099.099.099 */
    public static IP_ADDRESS: string = '099.099.099.099';

    /**##0,00% */
    public static PERCENT: string = '##0,00%';

    public static array(): Array<string>
    {
        return [
            this.DATE,
            this.TIME,
            this.DATE_TIME,
            this.CEP,
            this.PHONE,
            this.PHONE_DDD,
            this.PHONE_US,
            this.CPF,
            this.CNPJ,
            this.MONEY,
            this.MONEY2,
            this.IP_ADDRESS,
            this.PERCENT
        ];
    }
}

export class FSTextBoxBinder extends WidgetBinder
{
    private textBox: FSTextBox;
    constructor(textBox: FSTextBox) 
    {
        super(textBox);
        this.textBox = this.widget as FSTextBox;
    }
    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.textBox.setText(`${value}`);
    }
    fillPropertyModel(): void
    {
        var text: string = this.textBox.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue()
    {
        var text: string = this.textBox.getText();
        return text;
    }
}

export class FSTextBox extends FSWidget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="textEntry" class="form-group">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <input id="entryInput" class="form-control form-control-sm"  placeholder="Entry placeholder">
</div>`
    }
    public setEnabled(enabled: boolean): void
    {
        this.txInput.disabled = (enabled == false);
    }


    private initialTitle: string = null;
    private initialPlaceHolder: string = null;
    private initialText: string = null;

    private lbTitle: HTMLLabelElement = null;
    private txInput: HTMLInputElement = null;
    private divContainer: HTMLDivElement = null;

    constructor({ name, title, placeHolder, text }:
        {
            name: string;
            title?: string;
            placeHolder?: string;
            text?: string;
        })
    {
        super(name);

        this.initialTitle = title;
        this.initialPlaceHolder = placeHolder;
        this.initialText = text;
    }
    getBinder(): WidgetBinder
    {
        return new FSTextBoxBinder(this);
    }

    applyMask(maskPattern: string): void
    {
        //making jQuery call
        var jQueryCall = `$('#${this.txInput.id}').mask('${maskPattern}'`;
        var a = Mask.array();
        var hasReverseFields = (
            (a.indexOf(Mask.CPF) +
                a.indexOf(Mask.CNPJ) +
                a.indexOf(Mask.MONEY) +
                a.indexOf(Mask.MONEY2)) >= 0)
        if (hasReverseFields)
            jQueryCall += ', {reverse: true});';
        else
            jQueryCall += ');';

        var maskFunction = new PageJsFunction({
            fnName: 'enableMask',
            fnContent: jQueryCall
        });
        maskFunction.call();
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSTextBox>): void
    {
        renderer.render(this);
    }

    onWidgetDidLoad(): void
    {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('textEntry');

        this.lbTitle.innerText = this.initialTitle;
        this.txInput.placeholder = this.initialPlaceHolder;
        this.txInput.value = this.initialText;
    }
    public setPlaceholder(text: string): void
    {
        this.txInput.placeholder = text;
    }

    public getText(): string
    {
        return this.value();
    }

    public setText(newText: string): void
    {
        this.txInput.value = newText;
    }

    public setTitle(newTitle: string): void
    {
        this.lbTitle.textContent = newTitle;
    }

    public value(): string
    {
        return this.txInput.value;
    }

    public addCSSClass(className: string): void 
    {
        this.txInput.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.txInput.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void 
    {
        this.txInput.style.setProperty(propertyName, propertyValue);
    }

    public setPosition(position: string,
        marginLeft: string,
        marginTop: string,
        marginRight: string,
        marginBottom: string,
        transform?: string): void 
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }

    public setVisible(visible: boolean): void 
    {
        this.divContainer.hidden = (visible == false);
    }

}
export class FSToast extends FSWidget
{
    protected onWidgetDidLoad(): void
    {
        throw new Error("Method not implemented.");
    }
    protected htmlTemplate(): string
    {
        throw new Error("Method not implemented.");
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    
}
export class DataGridItem implements IDataGridItemTemplate
{
    public value: any;
    public itemName: string;
    private ownerDatagrid: FSDataGrid;
    public rowElement: HTMLTableRowElement;
    private pageShell: PageShell;

    private selected: boolean = false;

    constructor(name: string,
        model: any | object,
        pageShell: PageShell)
    {
        this.pageShell = pageShell;
        this.itemName = name;
        this.value = model;
    }

    setOwnerDataGrid(dataGrid: FSDataGrid): void
    {
        this.ownerDatagrid = dataGrid;
    }
    isSelected(): boolean
    {
        return this.selected;
    }
    select(): void
    {
        this.selected = true;
        this.rowElement.style.background = this.ownerDatagrid.selectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.selectedForeColor;
    }
    unSelect(): void
    {
        this.selected = false;
        this.rowElement.style.background = this.ownerDatagrid.unselectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.unselectedForeColor;
    }
    itemTemplate(): HTMLTableRowElement
    {
        var self = this;
        if (self.rowElement != null)
            return self.rowElement;

        var model = self.value;
        var tr = self.pageShell.createElement('tr')
        
        for (var k = 0; k < this.ownerDatagrid.MODEL_KEYS.length; k++)
        {
            var key = this.ownerDatagrid.MODEL_KEYS[k];
            var td = this.pageShell.createElement('td');

            td.innerText = model[key];
            tr.appendChild(td);
        }
        tr.onclick = function (ev)
        {
            self.ownerDatagrid.onRowClick(self);
        };

        self.rowElement = tr;
        return tr;
    }
}
export interface IDataGridItemTemplateProvider
{
    getDataGridItemTemplate(sender: FSDataGrid, viewModel: any | object): IDataGridItemTemplate;
}
export interface IDataGridItemTemplate
{
    value: any | object;
    itemName: string;
    setOwnerDataGrid(dataGrid: FSDataGrid): void;
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
    itemTemplate(): HTMLTableRowElement;
}
export interface IListItemTemplateProvider
{
    getListItemTemplate(sender: FSListView, viewModel: any|object): IListItemTemplate;
}
export interface IListItemTemplate 
{
    value: any|object;
    itemName: string;
    setOwnerList(listView: FSListView): void;
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
    itemTemplate(): HTMLAnchorElement;
}
export class ListItem implements IListItemTemplate
{
    public value: any|object;
    public itemName: string;
    public itemText: string;
    public itemImageSource: string;
    public itemBadgeText: string;
    private ownerList: FSListView;
    private anchorElement: HTMLAnchorElement;

    
    constructor(name: string, 
        text: string, 
        value?: any|object,
        imageSrc: string = null, 
        badgeText: string = null)
    {
        this.value = value;
        this.itemName = name;
        this.itemText = text;
        this.itemImageSource = imageSrc;
        this.itemBadgeText = badgeText;
    }

    public setOwnerList(listView: FSListView)
    {
        this.ownerList = listView;
    }

    public isSelected(): boolean
    {
        return this.anchorElement.classList.contains('active');
    }

    public select(): void
    {
        this.anchorElement.classList.add('active');
    }

    public unSelect(): void
    {
        this.anchorElement.classList.remove('active');
    }

    public itemTemplate() : HTMLAnchorElement
    {
        var self = this;
        if(self.anchorElement != null)
          return self.anchorElement;
 
        var pageShell = self.ownerList.getPageShell();

        self.anchorElement = pageShell.createElement('a');
        self.anchorElement.style.padding = '0px';
        self.anchorElement.classList.add('list-group-item', 'align-items-center', 'list-group-item-action');
        self.anchorElement.id = this.itemName;
        self.anchorElement.onclick = function(ev)
        {
            self.ownerList.onItemClicked(self, ev);
        };

        var rowDiv = pageShell.createElement('div');
        rowDiv.style.background = 'transparent';
        rowDiv.style.height = '35px';
        rowDiv.style.marginTop = '10px'
        rowDiv.classList.add('row');

        var col10Div = pageShell.createElement('div');
        col10Div.style.paddingLeft = '25px';
        col10Div.classList.add('col-10');

        if(this.itemImageSource != null)
        {
            var img = pageShell.createElement('img');
            img.src = this.itemImageSource;
            img.style.marginRight = '5px';
            img.width = 30;
            img.height = 30;

            col10Div.append(img);
        }

        col10Div.append(this.itemText);

        rowDiv.append(col10Div);

        if(this.itemBadgeText != null)
        {
            var col2Div = pageShell.createElement('div');
            col2Div.style.display = 'flex'
            col2Div.style.justifyContent = 'end'
            col2Div.style.alignSelf = 'center'

            col2Div.classList.add('col-2');
            var span = pageShell.createElement('span');

            span.classList.add('badge', 'badge-success', 'badge-pill');
            span.textContent = this.itemBadgeText;
            span.style.marginRight = '10px'
            
            col2Div.append(span);
            rowDiv.append(col2Div);
        }

        self.anchorElement.append(rowDiv);
        return self.anchorElement;
    }
}
export class FSTemplateView
{
    public templateDOM: Document;
    public templateString: string;

    private viewDictionary: Array<ViewDictionaryEntry>;
    private shellPage: PageShell;
    constructor(htmlContent: string, shell: PageShell)
    {
        this.shellPage = shell;
        this.viewDictionary = [];
        //  this.parentFragment.clear();

        var html: string = htmlContent;
        var parser = new DOMParser();
        var domObj = parser.parseFromString(html, "text/html");
        var allIds = domObj.querySelectorAll('*[id]');

        for (var i = 0; i < allIds.length; i++)
        {
            var element = allIds[i];
            var currentId = element.getAttribute('id');
            if (currentId != null)
            {
                var newId = `${currentId}_${FSWidget.generateUUID()}`;
                this.addDictionaryEntry(currentId, newId);
                element.setAttribute('id', newId);
            }
        }

        this.templateDOM = domObj;
        this.templateString = domObj.children[0].outerHTML;
    }

    content(): Element
    {
        return this.templateDOM.children[0];
    }

    public elementById<TElement>(elementId: string): TElement
    {
       for (var i = 0; i < this.viewDictionary.length; i++)
        {
            var entry: ViewDictionaryEntry = this.viewDictionary[i];
            if (entry.getOriginalId() == elementId)
            {
                var elementResult: any = this.templateDOM.getElementById(entry.getManagedId());
                return elementResult;
            }
        }
        return null as unknown as TElement;
    }

    private addDictionaryEntry(originalId: string, generatedId: string)
    {
        var entry = new ViewDictionaryEntry(originalId, generatedId);
        this.viewDictionary.push(entry);
    }
}
export class DataGridColumnDefinition
{
    /**Column Header */
    public h: string;

    /**Model key (property) name */
    public k: string;
}

export class FSDataGridBinder extends WidgetBinder
{
    private dataGrid: FSDataGrid;
    constructor(dataGrid: FSDataGrid)
    {
        super(dataGrid);
        this.dataGrid = dataGrid;
    }

    getWidgetValue()
    {
        return this.dataGrid.selectedValue();
    }
    refreshUI(): void
    {
        var viewModels:Array<any|object> = this.getModelPropertyValue();
        this.dataGrid.fromList(viewModels);
    }
    fillPropertyModel(): void  { }
}

export class FSDataGrid extends FSWidget implements IBindable
{
    public autoGenerateColumns: boolean;
    public table: HTMLTableElement;
    public selectedBackColor: string = '#007BFF';
    public unselectedBackColor: string = '#FFFFFF';

    public selectedForeColor: string = '#FFFFFF'
    public unselectedForeColor: string = '#000000'

    private templateProvider: IDataGridItemTemplateProvider;
    private items: Array<IDataGridItemTemplate> = [];

    public MODEL_KEYS: Array<string> = [];

    constructor({ name, autoGenCols = false, itemTemplateProvider = null }:
        {
            name: string,
            autoGenCols?: boolean,
            itemTemplateProvider?: IDataGridItemTemplateProvider
        })
    {
        super(name);
        this.templateProvider = itemTemplateProvider;
        this.autoGenerateColumns = autoGenCols;
    }
    getBinder(): WidgetBinder
    {
        return new FSDataGridBinder(this);
    }

    /**
     * 
     * @param colDefs array of { h: 'Column Header', k: 'model_property_name' }
     */
    public addColumns(colDefs: Array<DataGridColumnDefinition>): void
    {
        this.table.tHead.innerHTML = '';
        for (var i = 0; i < colDefs.length; i++)
        {
            var def: DataGridColumnDefinition = colDefs[i];
            this.addColumn(def.h, def.k);
        }
    }

    public addColumn(columnHeader: string, modelKey: string): void
    {
        var shell = this.getPageShell();
        this.MODEL_KEYS.push(modelKey);
        var thead = this.table.tHead;

        if (thead.childNodes.length == 0)
            thead.appendChild(shell.createElement('tr'));

        var th = shell.createElement('th', columnHeader);
        th.scope = 'col';
        thead.children[0].appendChild(th);
    }

    private generateColumns(list: Array<any>): void
    {
        this.autoGenerateColumns = false;
        this.table.tHead.innerHTML = '';
        this.MODEL_KEYS = [];

        var shell = this.getPageShell();

        //creating columns
        var tr: HTMLTableRowElement = shell.createElement('tr');
        let firstModel = list[0];
        for (let key in firstModel)
        {
            var th = shell.createElement('th');
            th.scope = 'col';
            th.textContent = key;
            tr.appendChild(th);
            this.MODEL_KEYS.push(key);
        }
        this.table.tHead.appendChild(tr);
    }

    public fromList(list: Array<any>): void
    {
        if ((list == null || list == undefined) || list.length == 0)
            return;

        this.table.tBodies[0].innerHTML = '';
        this.items = [];

        var shell = this.getPageShell();
        if (this.autoGenerateColumns)
            this.generateColumns(list);

        //adding rows
        for (var i = 0; i < list.length; i++)
        {
            var model = list[i];

            var itemTemplate: IDataGridItemTemplate;
            if (this.templateProvider == null)
                itemTemplate = new DataGridItem(`default_datagrid_item_${i + 1}`, model, shell);
            else
                itemTemplate = this.templateProvider.getDataGridItemTemplate(this, model);

            itemTemplate.setOwnerDataGrid(this);
            this.items.push(itemTemplate);
            this.table.tBodies[0].appendChild(itemTemplate.itemTemplate());
        }
    }

    public selectedItem(): IDataGridItemTemplate
    {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].isSelected())
                return this.items[i];
        return null;
    }

    public selectedValue(): any | object
    {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].isSelected())
                return this.items[i].value;
        return null;
    }

    public setSelectedItem(item: IDataGridItemTemplate): void
    {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
    }

    public setSelectedValue(model: any | object): void
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.value == model)
                item.select();
            else
                item.unSelect();
        }
    }

    public onRowClick(item: IDataGridItemTemplate): void
    {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
    }

    protected htmlTemplate(): string
    {
        return `
<table id="fsDataGrid" class="table table-hover table-bordered table-sm">
  <thead>
  </thead>
  <tbody>
  </tbody>
</table>        
`;
    }

    protected onWidgetDidLoad(): void
    {
        this.table = this.elementById('fsDataGrid');
        this.table.style.background = 'white';
    }

    public setCustomPresenter(presenter: ICustomWidgetPresenter<FSWidget>): void
    {
        presenter.render(this);
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }

}
