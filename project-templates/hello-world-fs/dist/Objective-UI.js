"use strict";
/**
 * A UIPage implementation is the first
 * Objective-UI class that is instantiated once the page loads.
 *
 * This class is responsible for initializing the rest of the
 * Objective-UI library and navigating to the first UIView to be displayed.
 *
 * Here it is also possible to enable features such as Splitting, Storage,
 * and also import native JavaScript-CSS libraries
 *
 * UIPage will initialize a `PageShell` and act in conjunction with it
 * to manipulate the DOM of the page as a general.
 */
class UIPage {
    constructor(doc) {
        this.mainShell = new PageShell(doc, this);
    }
    setStorageProvider(provider) {
        this.mainShell.setStorageProvider(provider);
    }
    enableSplitting(appContainerId, splitContainerId) {
        this.mainShell.enableSplitting(appContainerId, splitContainerId);
    }
    setLibRoot(rootPath) {
        PageShell.LIB_ROOT = rootPath;
    }
    importLib({ libName, cssPath, jsPath }) {
        this.mainShell.import(new NativeLib({ libName, cssPath, jsPath }));
    }
    navigateToView(view) {
        try {
            view.initialize(this.mainShell);
        }
        catch (error) {
            new DefaultExceptionPage(error);
        }
    }
}
UIPage.PRODUCT_VERSION = '0.8.1';
UIPage.DISABLE_EXCEPTION_PAGE = false;
/**
 * A UIView represents an interface view set of user controls.
 * UIView's are loaded and unloaded all the time and they
 * house a set of Widgets that give meaning to the view in
 * front of the user.
 *
 * We can say in general terms that
 * "this is a 'screen' of the application"
 */
class UIView {
    constructor(customLayoutPresenter) {
        this.customPresenter = customLayoutPresenter;
    }
    /**
     * (Optional overwrite) occurs when a Widget sends a message
     */
    onWidgetMessage(message) { }
    /**
     * Request an instance of the Storage implementation
     * for Session or Local storage by implementing IAppStorageProvider
     *
     * see:
     *
     * ```
     * interface IAppStorageProvider
     * ```
     * @param schemaName A unique id-name to determine the data scope
     */
    requestLocalStorage(schemaName) {
        return this.shellPage.requestStorage('local', schemaName);
    }
    requestSessionStorage(schemaName) {
        return this.shellPage.requestStorage('session', schemaName);
    }
    viewContext() {
        return this.widgetContext;
    }
    inflateTemplateView(rawHtml) {
        return new UITemplateView(rawHtml, this.shellPage);
    }
    onNotified(sender, args) {
        if (sender == 'FSWidgetContext')
            this.onViewDidLoad();
    }
    initialize(mainShell) {
        this.shellPage = mainShell;
        this.buildedLayout = this.buildLayout();
        this.buildedLayout.render(mainShell, this.customPresenter);
        var layoutCollection = this.buildedLayout.ElementsIdCollection();
        this.widgetContext = new WidgetContext(this.shellPage, layoutCollection, this.onWidgetMessage);
        this.view = this;
        this.view.composeView();
        this.widgetContext.build(this);
    }
    /**
     * Get all Widgets attached and managed in this UIView
     */
    managedWidgets() {
        if (this.widgetContext == null || this.widgetContext == undefined)
            return [];
        return this.widgetContext.getManagedWidgets();
    }
    /**
     * Adds one or more Widgets to a div specified in `ViewLayout`
     * @param layoutId An 'Id' of div contained in the `ViewLayout` class
     * @param widgets An array of Widget objects that will be bound to 'layoutId'
     */
    addWidgets(layoutId, ...widgets) {
        for (var i = 0; i < widgets.length; i++)
            this.widgetContext.addWidget(layoutId, widgets[i]);
    }
    /**
     * Remove a Widget managed by this UIView
     */
    removeWidget(widget) {
        this.viewContext().removeWidget(widget);
    }
    /**
     * Finds a Widget managed by this UIView
     *
     * @param layoutId An 'Id' div contained in the `ViewLayout`class
     * @param widgetName The name of a Widget managed by this UIView and previously attached to the ViewLayout through the specified 'layoutId'
     */
    findWidget(layoutId, widgetName) {
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
    createWidgetContext(managedDivIds, messageProtocol) {
        if (null == this.shellPage || undefined == this.shellPage)
            throw 'FSView.createWidgetContext(): It is not possible to do this as the View is not yet initialized. If you are making this call inside the constructor(), move it inside the composeView() function.';
        return new WidgetContext(this.shellPage, managedDivIds, messageProtocol);
    }
}
/**
A Widget is a TS object that represents a piece of HTML. It is able to
fetch that piece of html into a webdir and bring it to the MainPage.
of a WidgetContext and can manage several child Widgets.
It is also able to manage the elements marked with "id" attribute within that piece of HTML,
and then make them available to the inherited class as DOM objects.
 *
 */
class Widget {
    /**
     *
     * @param resourceName The name of the html resource that will be fetched from the webdir and linked to this Widget
     * @param widgetName A name for this Widget instance
     */
    constructor(widgetName) {
        this.widgetName = widgetName;
        this.viewDictionary = [];
        this.DOM;
    }
    /**
     * Occurs when the Widget is detached from the WidgetContext
     */
    onWidgetDetached() {
    }
    /**
     *
     * @param propertyPairs Array item: [{ p: 'xxx', v: 'vvv'}, ...]
     */
    applyAllCSS(propertyPairs) {
        for (var i = 0; i < propertyPairs.length; i++) {
            var css = propertyPairs[i];
            this.applyCSS(css.p, css.v);
        }
    }
    cssFromString(cssString) {
        var statements = cssString.split(';');
        for (var i = 0; i < statements.length; i++) {
            var statement = statements[i];
            if (statement == '')
                continue;
            var parts = statement.split(':');
            if (parts.length == 0)
                continue;
            var key = parts[0].trim();
            if (key == '')
                continue;
            var value = parts[1].trim();
            this.applyCSS(key, value);
        }
    }
    replaceCSSClass(oldClass, newClass) {
        this.removeCSSClass(oldClass);
        this.addCSSClass(newClass);
    }
    getPageShell() {
        try {
            return this.getOwnerFragment()
                .contextRoot
                .shellPage;
        }
        catch (error) {
            throw new Error(`Attempt to access or manipulate an unattached Widget. Check if the Widget was attached during the composeView() function of the respective View that originated this call.`);
        }
    }
    /**
     * Get the fragment (page div) that this widget owns
     * @returns WidgetFragment
     */
    getOwnerFragment() {
        return this.parentFragment;
    }
    /**
     * Determines the fragment (page div) that this widget owns
     */
    setParentFragment(parentFragment) {
        this.parentFragment = parentFragment;
    }
    /**
     * Sends a message from the inherited object towards the WidgetContext,
     * which then makes it available to the UIView in the "onWidgetMessage()" function call
     * @param messageId Set a default identifier for this message. This allows the receiver to determine the type of message (your widget may have some)
     * @param messageText A text for your message
     * @param messageAnyObject A custom data object
     */
    sendMessage(messageId, messageText, messageAnyObject) {
        var _a;
        (_a = this.parentFragment) === null || _a === void 0 ? void 0 : _a.pushMessageToRoot(this.widgetName, messageId, messageText, messageAnyObject);
    }
    processError(error) {
        new DefaultExceptionPage(error);
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
    getDOMElement() {
        if (this.viewDictionary.length == 0)
            return null;
        var firstId = this.viewDictionary[0].getOriginalId();
        return this.elementById(firstId);
    }
    /**
     * Gets a DOM object element from the value of the "id" attribute.
     * @param elementId Element id inside of the html template provided by inherited class
     * @returns
     */
    elementById(elementId) {
        var pageShell = this.getPageShell();
        for (var i = 0; i < this.viewDictionary.length; i++) {
            var entry = this.viewDictionary[i];
            if (entry.getOriginalId() == elementId) {
                var elementResult = pageShell.elementById(entry.getManagedId());
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
    addDictionaryEntry(originalId, generatedId) {
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
    renderView(onloadNotifiable) {
        var self = this;
        this.viewDictionary = [];
        var html = this.htmlTemplate();
        var parser = new DOMParser();
        var domObj = parser.parseFromString(html, "text/html");
        var allIds = domObj.querySelectorAll('*[id]');
        for (var i = 0; i < allIds.length; i++) {
            var element = allIds[i];
            var currentId = element.getAttribute('id');
            if (currentId != null) {
                var newId = `${currentId}_${Widget.generateUUID()}`;
                self.addDictionaryEntry(currentId, newId);
                element.setAttribute('id', newId);
            }
        }
        self.DOM = domObj;
        var child = domObj.documentElement.childNodes[1].firstChild;
        self.parentFragment.appendChildElementToContainer(child);
        self.onWidgetDidLoad();
        onloadNotifiable.onNotified('FSWidget', [self, domObj]);
    }
    onNotified(sender, args) { }
    /**
     * Public Domain/MIT
     *
     * This function generates a UUID (universal unique identifier value) to bind to an HTML element
     */
    static generateUUID() {
        var d = new Date().getTime(); //Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
        var res = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) { //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            }
            else { //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            var result = (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            return result;
        });
        return res.split('-')[0];
    }
}
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
class WidgetContext {
    constructor(shellPage, managedElementsIds, messageProtocolFunction) {
        this.contextLoaded = false;
        this.fragments = [];
        this.messageProtocolFunction = messageProtocolFunction;
        var self = this;
        self.shellPage = shellPage;
        for (var i = 0; i < managedElementsIds.length; i++) {
            var elementId = managedElementsIds[i];
            var divElement = shellPage.elementById(elementId);
            self.fragments.push(new WidgetFragment(self, divElement));
        }
    }
    contextShell() {
        return this.shellPage;
    }
    findFragment(fragmentName) {
        for (var i = 0; i < this.fragments.length; i++) {
            var fragment = this.fragments[i];
            if (fragment.fragmentId == fragmentName)
                return fragment;
        }
        return null;
    }
    findWidget(fragmentName, widgetName) {
        var fragment = this.findFragment(fragmentName);
        var widget = fragment.findWidget(widgetName);
        return widget;
    }
    pushMessage(widgetName, messageId, messageText, messageAnyObject) {
        if (this.messageProtocolFunction != null) {
            this.messageProtocolFunction(new WidgetMessage(widgetName, messageId, messageText, messageAnyObject));
        }
    }
    /**
     * Attaches a Widget to a `WidgetFragment`.
     * A `WidgetFragment` is the direct controller of ONE
     * div and can manage multiple Widgets related to this div
     */
    addWidget(fragmentName, widget) {
        var fragment = this.findFragment(fragmentName);
        fragment.attatchWidget(widget);
        if (this.contextLoaded) {
            fragment.renderFragmentwidgets();
        }
        return this;
    }
    getManagedWidgets() {
        try {
            var widgets = [];
            for (var frg = 0; frg < this.fragments.length; frg++) {
                var fragment = this.fragments[frg];
                for (var wdg = 0; wdg < fragment.widgets.length; wdg++) {
                    var widget = fragment.widgets[wdg];
                    widgets.push(widget);
                }
            }
            return widgets;
        }
        catch (e) {
            return [];
        }
    }
    removeWidget(widget) {
        if (widget == null)
            return;
        var fragment = widget.getOwnerFragment();
        if (fragment == null)
            return;
        fragment.dettatchwidget(widget);
    }
    onFragmentLoad() {
        this.fragmentsLoaded += 1;
        if (this.fragmentsLoaded == this.fragments.length) {
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
    build(notifiable, clear = false) {
        this.fragmentsLoaded = 0;
        this.notifiableView = notifiable;
        for (var i = 0; i < this.fragments.length; i++) {
            var fragment = this.fragments[i];
            if (clear == true)
                fragment.clear();
            fragment.renderFragmentwidgets();
        }
    }
}
/**
 * An efficient system of data binding and object synchronization (aka 'ViewModel')
 * with the User Interface
 *
 * Voce
 */
class BindingContext {
    /**
     * This is a concrete class and you should instantiate it normally,
     * You must provide an instance of the ViewModel and the inherited UIView currently displayed.
     * But ATTENTION you must do this INSIDE the onViewDidload() function of your UIView inherited class.
     *
     * ```
     *  export class MyView extends UIView {
     *     private binding: BindingContext<ModelType>;
     *     ...
     *     onViewDidload(): void {
     *        //Here Widgets attached in UIView will be linked with `ModelType`
     *        this.binding = new BindingContext<ModelType>(new ModelType(), this);
     *        ...
     *     }
     * ```
     * @param viewModel An instance of the ViewModel object
     * @param view UIView instance inherits class (the currently displayed UIView)
     */
    constructor(viewModel, view) {
        this._binders = [];
        this.viewModelInstance = viewModel;
        this.scanViewModel(view);
    }
    /**
     * Gets a WidgetBinderBehavior from which the behavior of data bindings will be changed.
     * @param modelPropertyName The name of the property/key present in the ViewModelType type
     * @returns `WidgetBinderBehavior`
     */
    getBindingFor(modelPropertyName) {
        var propBinders = [];
        for (var i = 0; i < this._binders.length; i++) {
            var binder = this._binders[i];
            if (binder.modelPropertyName == modelPropertyName)
                propBinders.push(binder);
        }
        return new WidgetBinderBehavior(propBinders);
    }
    /**
     * Causes a UI refresh on all Widgets managed by this Data Binding Context
     * based on the current values of the properties/keys of the ViewModelType instance \
     * \
     * (remember that the ViewModelType instance is managed by this context as well)
     */
    refreshAll() {
        for (var b = 0; b < this._binders.length; b++) {
            var binder = this._binders[b];
            binder.refreshUI();
        }
    }
    /**
     * Get an instance of `ViewModel` based on Widgets values
     * @returns `ViewModel`
     */
    getViewModel() {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].fillPropertyModel();
        return this.viewModelInstance;
    }
    /**
     * Defines an instance of `ViewModel`.\
     * This causes an immediate UI refresh on all widgets managed by this context. \
     * \
     * You can also use this to reset (say 'clear') the Widgets state by passing a `new ViewModel()`
     * @param viewModelInstance `ViewModel`
     * @returns
     */
    setViewModel(viewModelInstance) {
        this.viewModelInstance = viewModelInstance;
        for (var b = 0; b < this._binders.length; b++) {
            var binder = this._binders[b];
            binder.setModel(this.viewModelInstance, binder.modelPropertyName);
        }
        this.refreshAll();
        return this;
    }
    /**
     * Scans the Widgets managed in a UIView for matches with
     * properties/keys present in the ViewModel type object
     * managed by this Context
     */
    scanViewModel(view) {
        var self = this;
        var widgets = view.managedWidgets();
        if (widgets == null || widgets == undefined || widgets.length == 0)
            throw new Error("Illegal declaration: BindingContext cannot be initialized by the View's constructor. Consider instantiating it in onViewDidLoad()");
        for (var key in self.viewModelInstance) {
            for (var w = 0; w < widgets.length; w++) {
                var widget = widgets[w];
                var keyMatch = self.isModelPropertyMatchWithWidget(widget, key);
                if (keyMatch)
                    this.bindWidget(widget, key);
            }
        }
    }
    isModelPropertyMatchWithWidget(widget, modelKey) {
        var widgetName = widget.widgetName;
        if (widgetName.indexOf(modelKey) < 0)
            return false;
        var replaced = widgetName.replace(modelKey, '');
        var propLength = modelKey.length;
        var replacedLength = replaced.length;
        return (replacedLength < propLength);
    }
    bindWidget(widget, modelKey) {
        try {
            var binder = widget.getBinder();
            if (binder == null || binder == undefined)
                return null;
            binder.setModel(this.viewModelInstance, modelKey);
            this._binders.push(binder);
            return binder;
        }
        catch (_a) {
            return null;
        }
    }
}
/**
 *  Allows you to define binding behaviors for a
 * set of `WidgetBinder`
 * classes that are bound to a property/key of
 * the object-model being managed by the `BindingContext<T>`
 */
class WidgetBinderBehavior {
    constructor(binders) {
        this._binders = binders;
    }
    /**
     * When data binding is done based on a list of model objects,
     * it may be necessary to specify a binding path INSIDE that model
     * object via its properties/keys.
     *
     * This happens for example when binding a
     * list of `'Contact'` in `UISelect` or `UIList`:
     * although they are able to load an Array<Contact>,
     * they won't know that they should use the prop/key 'Id'
     * like selection value and the 'Name' prop/key as
     * the display value.
     * @param displayPropertyName The prop/key on the model object that will be displayed in the control
     * @param valuePropertyName The prop/key in the model object that will be used as the selected value in the Widget
     */
    hasPath(displayPropertyName, valuePropertyName) {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].hasPath(displayPropertyName, valuePropertyName);
        return this;
    }
    /**
     * Set a target when you want the selected Widget
     * value to be transferred to a given property/key
     * in the same model-object.
     * @param targetValuePropertyName  Property/key in the model-class to which the selected Widget-value will be transferred.
     */
    hasTarget(targetValuePropertyName) {
        for (var i = 0; i < this._binders.length; i++)
            this._binders[i].hasTarget(targetValuePropertyName);
        return this;
    }
}
/**
 * It acts as a bridge between the `BindingContext<T>`
 * and the respective Widget.
 *
 * This allows the Widget to incorporate Data Binding
 * functionality with model-objects.
 *
 * If you have a custom `Widget` created in your project,
 * you will need to provide a `WidgetBinder` implementation
 * to provide Data Binding functionality
 */
class WidgetBinder {
    constructor(widget) {
        this.widget = widget;
        this.widgetName = widget.widgetName;
        this.bindingName = `${typeof (widget)}Binding ${this.widgetName} => ${typeof (widget)}`;
    }
    getModelPropertyValue() {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return null;
        var value = this._viewModel[this.modelPropertyName];
        return value;
    }
    setModelPropertyValue(value) {
        if (this._viewModel == null || this.modelPropertyName == null || this.modelPropertyName == '')
            return;
        this._viewModel[this.modelPropertyName] = value;
    }
    toString() {
        return this.bindingName;
    }
    hasPath(displayPropertyName, valuePropertyName) {
        this.bindingHasPath = true;
        this.displayProperty = displayPropertyName;
        this.valueProperty = valuePropertyName;
        this.refreshUI();
        return this;
    }
    hasTarget(targetValuePropertyName) {
        this.modelTargetPropertyName = targetValuePropertyName;
        return this;
    }
    isTargetDefined() {
        return this.modelTargetPropertyName != null;
    }
    fillModelTargetPropertyValue() {
        if (this.isTargetDefined() == false)
            return;
        var value = this.getWidgetValue();
        this._viewModel[this.modelTargetPropertyName] = value;
    }
    getModelTargetPropertyValue() {
        if (this.isTargetDefined() == false)
            return;
        var value = this._viewModel[this.modelTargetPropertyName];
        return value;
    }
    setModel(viewModelInstance, propertyName) {
        this._viewModel = viewModelInstance;
        this.modelPropertyName = propertyName;
        this.bindingName = `${typeof (this.widget)}Binding ${this.widgetName} => ${typeof (this.widget)}.${this.modelPropertyName}`;
        this.refreshUI();
    }
}
class Bearer {
    static get(token) {
        return new Headers({
            'content-type': 'application/json',
            'authorization': `Bearer ${token}`
        });
    }
}
class APIResponse {
    constructor({ code, msg, content }) {
        this.statusCode = code;
        this.statusMessage = msg;
        this.content = content;
    }
}
/**
 * Offers an abstraction for consuming REST APIs with the
 * possibility of simulating a local
 * API for development purposes;
 *
 * If your FrontEnd is not running alongside the API,
 * be careful to call previously (once)
 * ```
 * WebAPI.setURLBase('https://complete-url-of-api.com')
 * ```
 *
 * Example:
 * ```
WebAPI
.POST('/api/route/xyz') //.GET() / .PUT() / .DELETE()
.withBody(objectBodyHere) //if .POST() or .PUT()
.onSuccess(function (res: APIResponse){
    //success handle function
})
.onError(function(err: Error){
    //request-error handle function
})
.call(); //call REST api
 * ```
 */
class WebAPI {
    constructor(url, method) {
        this.request = {};
        this.request.method = method;
        this.apiUrl = url;
        this.withHeaders(new Headers({ 'content-type': 'application/json' }));
    }
    static setURLBase(apiUrlBase) {
        WebAPI.urlBase = apiUrlBase;
    }
    static requestTo(requestString, httpMethod) {
        if (requestString.startsWith('http'))
            return new WebAPI(requestString, httpMethod);
        else {
            if (this.urlBase == '' || this.urlBase == undefined)
                return new WebAPI(`${requestString}`, httpMethod);
            else
                return new WebAPI(`${WebAPI.urlBase}${requestString}`, httpMethod);
        }
    }
    static useSimulator(simulator) {
        WebAPI.simulator = simulator;
    }
    static GET(requestString) {
        return this.requestTo(requestString, 'GET');
    }
    static POST(requestString) {
        return this.requestTo(requestString, 'POST');
    }
    static PUT(requestString) {
        return this.requestTo(requestString, 'PUT');
    }
    static DELETE(requestString) {
        return this.requestTo(requestString, 'DELETE');
    }
    call() {
        if (WebAPI.simulator == null) {
            var statusCode;
            var statusMsg;
            var self = this;
            fetch(self.apiUrl, self.request)
                .then(function (ret) {
                statusCode = ret.status;
                statusMsg = ret.statusText;
                return ret.text();
            })
                .then(function (text) {
                var json = null;
                if (text.startsWith("{") || text.startsWith("["))
                    json = JSON.parse(text);
                var apiResponse = new APIResponse({
                    code: statusCode, msg: statusMsg, content: json
                });
                return apiResponse;
            })
                .then(function (res) {
                if (self.fnOnSuccess != null)
                    self.fnOnSuccess(res);
                if (self.fnDataResultTo != null) {
                    if (res.statusCode == 200) {
                        var data = res.content;
                        self.fnDataResultTo(data);
                    }
                }
            })
                .catch(err => (self.fnOnError == null ? {} : self.fnOnError(err)));
        }
        else {
            try {
                var result = WebAPI.simulator.simulateRequest(this.request.method, this.apiUrl.replace(WebAPI.urlBase, ''), this.request.body);
                this.fnOnSuccess(result);
            }
            catch (error) {
                this.fnOnError(error);
            }
        }
    }
    dataResultTo(callBack) {
        this.fnDataResultTo = callBack;
        return this;
    }
    onSuccess(callBack) {
        this.fnOnSuccess = callBack;
        return this;
    }
    onError(callBack) {
        this.fnOnError = callBack;
        return this;
    }
    withAllOptions(requestInit) {
        this.request = requestInit;
        return this;
    }
    withBody(requestBody) {
        this.request.body = JSON.stringify(requestBody);
        return this;
    }
    withHeaders(headers) {
        this.request.headers = headers;
        return this;
    }
}
class SimulatedAPIRoute {
    constructor(resource, method, endPoint) {
        this.method = method;
        this.resource = resource;
        this.endPoint = endPoint;
    }
    getMethod() {
        return this.method;
    }
    getResource() {
        return this.resource;
    }
    simulateRoute({ body = null, params = null }) {
        if (this.method == 'GET' || this.method == 'DELETE') {
            return this.endPoint(params);
        }
        else
            return this.endPoint(body);
    }
    toString() {
        return `[${this.method}] ${this.resource}`;
    }
}
/**
 * Allows you to simulate a REST API locally based on an
 * API that may not yet exist, but will respond for the routes
 * that are defined in the Simulator.
 *
 * You must inherit this class and define it in
    ```
    WebAPI.useSimulator(new MyAPISimulatorImpl());
    ```
 */
class WebAPISimulator {
    constructor() {
        this.simulatedRoutes = [];
    }
    /**
     * Maps a simulated route to which this
     * Simulator should respond when
     * ```
     *WebAPI.call()
     * ```
     * is invoked
     *
     * @param httpMethod 'GET' / 'POST' / 'PUT' / 'DELETE'
     * @param resource The resource name or endpoint path that the real API would have
     * @param endPoint A function (callback) that should respond for the resource endpoint
     *
     * Function definition should follow these standards:
     *
     * **for GET/DELETE routes** -
     *  ```
     * functionEndpointName(params: Array<string>): any|object
     * ```
     *
     * **for POST/PUT routes**
     * ```
     * functionEndpointName(body: any|object): any|object
     * ```
     */
    mapRoute(httpMethod, resource, endPoint) {
        this.simulatedRoutes.push(new SimulatedAPIRoute(resource, httpMethod, endPoint));
        return this;
    }
    /**
     * Fires a request originating from the `WebAPI`
     * class and redirected to the Simulator,
     * which will respond by calling
     * a "fake-endpoint" function
     */
    simulateRequest(httpMethod, resource, body) {
        for (var i = 0; i < this.simulatedRoutes.length; i++) {
            const route = this.simulatedRoutes[i];
            const isResource = resource.startsWith(route.getResource());
            const isMethod = httpMethod == route.getMethod();
            if (isResource && isMethod) {
                if (route.getMethod() == 'GET' || route.getMethod() == 'DELETE') {
                    const path = resource.replace(route.getResource(), '');
                    var params = path.split('/');
                    if (params.length > 0)
                        if (params[0] == '')
                            params = params.splice(-1, 1);
                    return new APIResponse({
                        code: 200,
                        msg: 'fetched from API Simulator',
                        content: route.simulateRoute({ params })
                    });
                }
                if (route.getMethod() == 'POST' || route.getMethod() == 'PUT') {
                    return new APIResponse({
                        code: 200,
                        msg: 'fetched from API Simulator',
                        content: route.simulateRoute({ body: JSON.parse(body) })
                    });
                }
                break;
            }
        }
    }
}
/**
 * Initialization options for div-columns
 */
class ColOptions {
}
/**
 * Represents a Column-Div with standard Bootstrap classes and a height of 100px
 */
class Col {
    /**
     *
     * @param id The 'Id' attribute that the resulting div will have
     * @param options
     */
    constructor(id, options) {
        this.colClass = 'col-lg-12 col-md-12 col-sm-12 col-sm-12';
        this.colHeight = '100px';
        this.columnRows = [];
        this.id = id;
        if (options != null) {
            if (Misc.isNullOrEmpty(options.colHeight) == false)
                this.colHeight = options.colHeight;
            if (Misc.isNullOrEmpty(options.colClass) == false)
                this.colClass = options.colClass;
            if (options.rows !== null)
                this.columnRows = options.rows;
        }
    }
}
/**
 * A standard implementation for `ILayoutPresenter`
 */
class DefaultLayoutPresenter {
    constructor() {
        this.presenter = this;
    }
    renderLayout(layout, pageShell) {
        this.pageShell = pageShell;
        var parentContainer = layout.containerDivObj;
        if (parentContainer == null)
            return null;
        parentContainer.innerHTML = '';
        // parentContainer.style.opacity = '0';
        for (let rowIndex = 0; rowIndex < layout.layoutRows.length; rowIndex++) {
            var rowObj = layout.layoutRows[rowIndex];
            var rowView = this.renderRow(rowObj);
            parentContainer.appendChild(rowView);
        }
        return parentContainer;
    }
    renderRow(row) {
        //creates master row div
        const rowDiv = document.createElement("div");
        if (row.rowClass != null && row.rowClass != undefined) {
            const classes = row.rowClass.split(' ');
            for (var i = 0; i < classes.length; i++) {
                const className = classes[i].trim();
                if (className == '')
                    continue;
                rowDiv.classList.add(className);
            }
        }
        rowDiv.id = row.id;
        rowDiv.style.height = row.rowHeidth;
        if (row.rowColumns != null) {
            for (let index = 0; index < row.rowColumns.length; index++) {
                const column = row.rowColumns[index];
                //an sub-div column
                const colDiv = document.createElement("div");
                if (Misc.isNullOrEmpty(column.colClass) == false) {
                    const classes = column.colClass.split(' ');
                    for (var i = 0; i < classes.length; i++) {
                        const className = classes[i].trim();
                        if (className == '')
                            continue;
                        colDiv.classList.add(className);
                    }
                }
                colDiv.id = column.id;
                colDiv.style.height = column.colHeight;
                rowDiv.appendChild(colDiv);
                if (column.columnRows != null) {
                    for (let subRowIndex = 0; subRowIndex < column.columnRows.length; subRowIndex++) {
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
/**
 * Used to do library imports (reference CSS and JavaScript) in a single function.
 *
 * A few JavaScript libraries may not work properly
 * due to the way your code initializes them.
 * At this time, you should resort to
 * `<script />` import directly into
 * the .HTML page.
 */
class NativeLib {
    /**
     * Library to be imported.\
     * NOTE!!!: the root-path considered here is `'/lib/'` and this is determined by the static variable `PageShell.LIB_ROOT`
     * @param libName The library folder itself
     * @param cssPath The name (or subpath) of the library's .css file. If not, ignore this parameter.
     * @param jsPath The name (or subpath) of the library's .js file. If not, ignore this parameter.
     */
    constructor({ libName, cssPath = '', jsPath = '' }) {
        this.libName = libName;
        this.cssPath = cssPath;
        this.jsPath = jsPath;
        this.hasCss = (cssPath != '' && cssPath != null);
        this.hasJs = (jsPath != '' && jsPath != null);
    }
    getCssFullPath() {
        return `${PageShell.LIB_ROOT}${this.libName}/${this.cssPath}`;
    }
    getJsFullPath() {
        return `${PageShell.LIB_ROOT}${this.libName}/${this.jsPath}`;
    }
    toString() {
        return this.libName;
    }
}
/**
 * PageShell is a class that works at the lowest level (next to the page)
 * and performs some tasks in the DOM interface such as
 * creating/finding/removing elements,
 * directly importing native JS-CSS libraries
 * and controlling access to resources such as SplitView, Storage and others.
 */
class PageShell {
    constructor(mainDocument, fsPage) {
        this.appStorageProvider = null;
        this.currentViewSplitted = false;
        this.baseDocument = mainDocument;
        this.importedLibs = [];
        this.page = fsPage;
    }
    /**
     * Called from the `UIPage` implementation,
     * enables the Storage feature,
     * indicating a implementation of the `IAppStorageProvider` interface
     * @param provider
     */
    setStorageProvider(provider) {
        this.appStorageProvider = provider;
    }
    /**
     * Called from the UIView or other high consumer-classes, requests an instance of `AppStorage`
     * which must be resolved by the implementation of `IAppStorageProvider`
     * (usually the same one that implements `UIPage`)
     * @param type `'local'` to LocalStorage or `'session'` to  SessionStorage
     * @param schemaName A unique name to demarcate a data context
     * @returns `AppStorage` instance
     */
    requestStorage(type, schemaName) {
        return this.appStorageProvider.onStorageRequested(type, schemaName);
    }
    /**
     * Enables the SplitView feature and allows two
     * UIViews to be loaded simultaneously side-by-side on the page.
     *
     * You must have marked this `<div id="app/split" />` previously in your HTML file.
     *
     * @param appContainerId Id of the page's main app container div. The div that will display most UIView's in your app
     * @param splitContainerId Split container div id. The secondary UIView will be loaded in this Div
     */
    enableSplitting(appContainerId, splitContainerId) {
        this.appContainer = this.elementById(appContainerId);
        this.splitContainer = this.elementById(splitContainerId);
        if (this.splitContainer == null)
            throw new Error(`enable split fail: container Id '${splitContainerId}' not found in document. An div tag with this Id maybe not present.`);
        this.splitContainer.style.width = '0 px';
        this.splitContainer.hidden = true;
    }
    /**
     * Determines if SplitView is currently active
     */
    isViewSplitted() {
        return this.currentViewSplitted;
    }
    /**
     * Sets the currently Splitted UIView to a reduced size
     * This will only work if `PageShell.isViewSplitted()` is `true`.
     */
    shrinkSplitView() {
        if (this.currentViewSplitted == false)
            return;
        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function () {
            self.appContainer.classList.remove('col-6');
            self.appContainer.classList.add('col-9');
            self.splitContainer.classList.remove('col-6');
            self.splitContainer.classList.add('col-3');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;
        self.splitContainer.style.borderLeft = '3px solid gray';
    }
    /**
     * Sets the currently Splitted UIView to a side-by-side size (50%)
     */
    expandSplitView() {
        if (this.currentViewSplitted == false)
            return;
        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function () {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-6');
            self.splitContainer.classList.remove(...self.splitContainer.classList);
            self.splitContainer.classList.add('col-6');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;
        self.splitContainer.style.borderLeft = '3px solid gray';
    }
    /**
     * Initializes a new UIView alongside the currently displayed UIView via SplitView features
     * @param ownerSplitView UIView currently displayed
     * @param splittedCallingView  New UIView that will be displayed next to the current one
     */
    requestSplitView(ownerSplitView, splittedCallingView) {
        if (this.currentViewSplitted)
            return;
        var self = this;
        this.splitContainer.hidden = false;
        var interv = setInterval(function () {
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-9');
            clearInterval(interv);
        });
        this.currentViewSplitted = true;
        self.splitContainer.style.borderLeft = '3px solid gray';
        this.navigateToView(splittedCallingView);
        splittedCallingView.onConnectViews(ownerSplitView);
    }
    /**
     * Fully collapse the SplitView Div and destroy the currently used UIView with Split
     */
    closeSplitView() {
        if (this.currentViewSplitted == false)
            return;
        var self = this;
        this.splitContainer.innerHTML = '';
        this.splitContainer.hidden = true;
        var interv = setInterval(function () {
            self.splitContainer.classList.remove(...self.splitContainer.classList);
            self.splitContainer.classList.add('col-3');
            self.appContainer.classList.remove(...self.appContainer.classList);
            self.appContainer.classList.add('col-12');
            clearInterval(interv);
        });
        this.currentViewSplitted = false;
    }
    /**
     * Creates (say "instance") a new HTMLElement object that represents an original HTML tag with its properties and attributes
     * @param tagName The exact name of the desired HTML5 tag
     * @param innerText (Optional) an initial text inserted as tag content (if the html element supports it)
     * @returns
     */
    createElement(tagName, innerText) {
        var element = this.baseDocument.createElement(tagName);
        if (innerText != null)
            element.innerText = innerText;
        return element;
    }
    /**
     * Renders and brings to the front a view generated by a UIView object
     * @param view
     */
    navigateToView(view) {
        this.page.navigateToView(view);
    }
    /**
     * Get the `<body>` of the page
     * @returns
     */
    getPageBody() {
        return this.elementsByTagName('body')[0];
    }
    elementsByTagName(tagName) {
        return this.baseDocument.getElementsByTagName(tagName);
    }
    elementById(elementId) {
        return this.baseDocument.getElementById(elementId);
    }
    appendChildToElement(containerElement, childElement) {
        return containerElement.appendChild(childElement);
    }
    removeChildFromElement(containerElement, childElement) {
        return containerElement.removeChild(childElement);
    }
    getImportedLib(libName) {
        if (this.importedLibs == undefined)
            return;
        for (var i = 0; i < this.importedLibs.length; i++)
            if (this.importedLibs[i].libName == libName)
                return this.importedLibs[i];
        return null;
    }
    /**
     * Import a native JS-CSS library into the page,
     * specifying the name and paths to the
     * .js and .css content files
     */
    import(lib) {
        var existing = this.getImportedLib(lib.libName);
        if (existing !== null)
            return;
        if (lib.hasCss) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = lib.getCssFullPath();
            document.head.appendChild(link);
        }
        if (lib.hasJs) {
            var jsImport = document.createElement('script');
            jsImport.src = lib.getJsFullPath();
            document.body.appendChild(jsImport);
        }
        this.importedLibs.push(lib);
    }
}
/**defaults: '/lib/' */
PageShell.LIB_ROOT = '/lib/';
class RowOptions {
    constructor() {
        this.columns = [];
        this.rowClass = 'row';
    }
}
/**
 * Represents a Row Div with standard Bootstrap class options
 */
class Row {
    /**
     *
     * @param id A div-container Id to parent this
     * @param options Row options like class, height and sub-columns; NOTE: if no column is provided, it may be that at least
     * one column is generated automatically. To determine this,
     * check the static variable `ViewLayout.AUTO_GENERATE_COLUMNS`
     */
    constructor(id, options) {
        this.rowClass = 'row';
        this.rowColumns = [];
        this.id = id;
        if (Misc.isNullOrEmpty(options.rowClass) == false)
            this.rowClass = options.rowClass;
        if (Misc.isNullOrEmpty(options.rowHeidth) == false)
            this.rowHeidth = options.rowHeidth;
        if (Misc.isNull(options.columns) == false)
            this.rowColumns = options.columns;
        if ((this.rowColumns == null || this.rowColumns == undefined) || this.rowColumns.length == 0) {
            if (ViewLayout.AUTO_GENERATE_COLUMNS) {
                var id = `col_${Widget.generateUUID()}`;
                this.generatedColumnId = id;
                this.rowColumns = [
                    new Col(id, { colClass: 'col-md-12 col-xs-12 col-lg-12 col-sm-12' })
                ];
            }
        }
        else {
            for (var i = 0; i < this.rowColumns.length; i++) {
                var column = this.rowColumns[i];
                if (Misc.isNullOrEmpty(column.colClass))
                    column.colClass = 'col-md-12 col-xs-12 col-lg-12 col-sm-12';
            }
        }
    }
}
class Misc {
    static isNull(value) {
        return (value == null || value == undefined);
    }
    static isNullOrEmpty(value) {
        return (value == null || value == undefined || value == '');
    }
}
/**
 * A common abstraction for local storage features,
 * which can be persistent (aka 'LocalStorage')
 * or temporary (aka 'SessionStorage')
 * */
class AppStorage {
    /**
     * To provide a concrete instance of this class,
     * you must first implement `IAppStorageProvider`
     * from your inherited `UIPage` class.
     *
     * @param type 'local' or 'session'
     * @param schemaName A unique name to demarcate a data context
     */
    constructor(type, schemaName) {
        this.type = type;
        this.schemaName = schemaName;
    }
}
class RhabooInstance {
    constructor() {
        this.name = null;
        this.instance = null;
    }
}
class RhabooStorageWrapper extends AppStorage {
    /**
     *  REQUIRED `<script src="lib/rhaboo/rhaboo.js"></script>`
     *
     *
     * This is an implemented portability of "Rhaboo" (https://github.com/adrianmay/rhaboo),
     * a powerful JavaScript library that allows storing
     * object graphs (with references) in
     * LocalStorage or SessionStorage with great
     * precision and consistency.
     */
    constructor(type, schemaName) {
        super(type, schemaName);
        var rhabooInstanceType = (type == 'local' ? 'persistent' : 'perishable');
        var activate = new VirtualFunction({
            fnName: 'rhabooInstance',
            fnContent: `
                var rb = Rhaboo.${rhabooInstanceType}('${schemaName}');
                RhabooStorageWrapper.addInstance({ name: '${schemaName}', instance: rb });
            `
        });
        activate.call();
        for (var i = 0; i < RhabooStorageWrapper.INSTANCES.length; i++) {
            var instance = RhabooStorageWrapper.INSTANCES[i];
            if (instance.name == schemaName) {
                this.rhaboo = instance;
                break;
            }
        }
    }
    static addInstance(instance) {
        RhabooStorageWrapper.INSTANCES.push(instance);
    }
    write(key, value) {
        this.rhaboo.instance.write(key, value);
    }
    update(key, value) {
        this.erase(key);
        this.write(key, value);
    }
    erase(key) {
        this.rhaboo.instance.erase(key);
    }
    get(key) {
        return this.rhaboo.instance[key];
    }
}
RhabooStorageWrapper.INSTANCES = [];
class SelectOption {
    constructor(opValue, opText) {
        this.value = opValue;
        this.text = opText;
    }
}
class ViewDictionaryEntry {
    constructor(originalId, managedId) {
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
/**
 * ViewLayout is a class that logically contains a demarcation
 * of divs that will be used by the UIView inherited class,
 * when this View is rendered. \
 * \
 * It is possible to build the layout in the form of an object:
 * ```
new ViewLayout('app', [
    new Row('row-X', { rowClass: 'row', rowHeidth: '100px',
        columns: [
            new Col('col-Y-left', { colClass: 'col-8',  colHeight: '80px' }),
            new Col('col-Y-right', { colClass: 'col-4', colHeight: '20px' )
        ]
    }),
])
 * ```
 * attributes are optional but can take on unwanted default values.
 *
 * Or directly by a raw-html string:
 *
 * ```
new ViewLayout('app').fromHTML(`
    <div class="row-x" style="height:100px">
        <div id="col-Y-left"  class="col-8"  style="height:80px"> </div>
        <div id="col-Y-right" class="col-4" style="height:20px"> </div>
    </div>
`);
 * ```
 */
class ViewLayout {
    /**
     *
     * @param containerDivId Provide the 'Id' of the Div that will contain this layout (and consequently the Widgets elements)
     * @param rows Provide root rows for this layout. Ignore this parameter if you want to provide the layout from raw-html content (via `ViewLayout().fromHTML()`)
     */
    constructor(containerDivId, rows) {
        this.fromString = false;
        this.layoutPresenter = new DefaultLayoutPresenter();
        this.layoutRows = rows;
        this.containerDivName = containerDivId;
    }
    getRow(rowId) {
        if (this.fromString)
            throw new Error('getRow() is not supported when layout is output over raw html string');
        for (var i = 0; i < this.layoutRows.length; i++)
            if (this.layoutRows[i].id == rowId)
                return this.layoutRows[i];
        return null;
    }
    fromHTML(rawHtmlLayoutString) {
        this.fromString = true;
        this.rawHtml = rawHtmlLayoutString;
        return this;
    }
    render(shellPage, customPresenter) {
        this.containerDivObj = shellPage.elementById(this.containerDivName);
        if (this.fromString) {
            var parser = new DOMParser();
            var dom = parser.parseFromString(this.rawHtml, 'text/html');
            this.layoutDOM = dom;
            this.containerDivObj.innerHTML = '';
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
    ElementsIdCollection() {
        if (this.fromString) {
            var idCollection = [];
            var nodesWithId = this.containerDivObj.querySelectorAll('*[id]');
            for (var i = 0; i < nodesWithId.length; i++)
                idCollection.push(nodesWithId[i].id);
            return idCollection;
        }
        return this.ScanRows(this.layoutRows);
    }
    ScanRows(rows) {
        var result = [];
        if (rows !== undefined) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                result.push(row.id);
                if (row.rowColumns !== undefined) {
                    var cols = this.ScanColumns(row.rowColumns);
                    for (var c = 0; c < cols.length; c++)
                        result.push(cols[c]);
                }
            }
        }
        return result;
    }
    ScanColumns(columns) {
        var result = [];
        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            result.push(col.id);
            if (col.columnRows !== null) {
                var rows = this.ScanRows(col.columnRows);
                for (var r = 0; r < rows.length; r++)
                    result.push(rows[r]);
            }
        }
        return result;
    }
}
ViewLayout.AUTO_GENERATE_COLUMNS = false;
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
class WidgetFragment {
    /**
     *
     * @param appContextRoot The parent WidgetContext
     * @param containerElement An (Element object) HTML element to compose the adjacent Widgets. Usually Div's.
     */
    constructor(appContextRoot, containerElement) {
        this.contextRoot = appContextRoot;
        this.fragmentId = containerElement.getAttribute('id');
        //div object (not id)
        this.containerElement = containerElement;
        this.widgets = [];
    }
    clear() {
        this.containerElement.innerHTML = '';
    }
    /**
     * Submit a message request sent by the Widget directed to the parent-Context
     * @param widgetName The widget instance-name
     * @param messageId An "ID" of the message. The Widget may have its own message ID catalog for its respective handling cases.
     * @param messageText A text for the message
     * @param messageAnyObject Any object defined by the Widget itself. There are no restrictions on the object type.
     */
    pushMessageToRoot(widgetName, messageId, messageText, messageAnyObject) {
        this.contextRoot.pushMessage(widgetName, messageId, messageText, messageAnyObject);
    }
    /**
     * Gets an Widget object instance
     * @param name Widget Instance Name
     * @returns Widget
     */
    findWidget(name) {
        for (var i = 0; i < this.widgets.length; i++) {
            var widget = this.widgets[i];
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
    onWidgetLoad() {
        this.widgetsLoaded += 1;
        if (this.widgetsLoaded == this.widgets.length) //stack is end
            this.contextRoot.onFragmentLoad(); //notify to parent-ctx: "all Widgets been loaded :)""
    }
    resetFragment() {
        this.containerElement.innerHTML = '';
    }
    /**
     * Renders the Child Widgets stack on the specified Container
     */
    renderFragmentwidgets() {
        this.widgetsLoaded = 0;
        if (this.widgets.length == 0)
            this.contextRoot.onFragmentLoad();
        else {
            var self = this;
            var shell = this.contextRoot.contextShell();
            self.containerElement.style.opacity = '0';
            for (var i = 0; i < self.widgets.length; i++) {
                var widget = self.widgets[i];
                widget.renderView(this);
            }
            var opacity = 0;
            var interv = setInterval(function () {
                if (opacity < 1) {
                    opacity = opacity + 0.070;
                    self.containerElement.style.opacity = opacity.toString();
                }
                else
                    clearInterval(interv);
            });
        }
    }
    onNotified(sender, args) {
        if (sender == 'FSWidget')
            this.onWidgetLoad();
    }
    /**
     * Attach a Widget to the Fragment
     * @param widget An Widget object
     */
    attatchWidget(widget) {
        for (var i = 0; i < this.widgets.length; i++) {
            var existingWidget = this.widgets[i];
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
    dettatchwidget(widget) {
        var toRemove = -1;
        for (let index = 0; index < this.widgets.length; index++) {
            var existingWidget = this.widgets[index];
            if (existingWidget.widgetName == widget.widgetName) {
                toRemove = index;
                break;
            }
        }
        if (toRemove > -1) {
            this.widgets.splice(toRemove, 1);
            this.containerElement.removeChild(widget.getDOMElement());
            widget.onWidgetDetached();
        }
    }
    appendChildElementToContainer(elementChild) {
        this.contextRoot.contextShell().appendChildToElement(this.containerElement, elementChild);
    }
}
class WidgetMessage {
    constructor(widgetName, messageId, messageText, messageAnyObject) {
        this.widgetName = widgetName;
        this.messageId = messageId;
        this.messageText = messageText;
        this.messageAnyObject = messageAnyObject;
    }
}
/**
 * Represents a native JavaScript function virtually controlled by TypeScript
 *
 * Through this class, a JavaScript function will be
 * dynamically placed in the DOM of the page,
 * executed and then destroyed.
 *
 * From this, it is possible to invoke functions from
 * native JavaScript libraries from the written TypeScrit
 * code.
 */
class VirtualFunction {
    /**
     * Defines a JavaScript virtual function
     * @param fnName the function name
     * @param fnArgNames An array with the names of the function's arguments (the variables that the function takes)
     * @param fnContent The literal body of the function; NOTE: you must not specify `{ or } ` here. Only the raw body of the function is allowed
     * @param keepAfterCalled Determines whether the function should remain active on the page after the first call. By default it is false.
     */
    constructor({ fnName, fnArgNames = [], fnContent, keepAfterCalled = false }) {
        this.functionName = fnName;
        this.keep = keepAfterCalled;
        this.functionArgs = fnArgNames;
        this.functionBodyContent = fnContent;
        this.functionId = Widget.generateUUID();
    }
    toString() {
        return `function ${this.functionName}(${this.argNamesStr()});`;
    }
    /**
     * @param fnContent The literal body of the function; NOTE: you must not specify `{ or } ` here. Only the raw body of the function is allowed
     */
    setContent(fnContent) {
        this.functionBodyContent = fnContent;
        return this;
    }
    /**
     * Calls the JavaScript function.
     * Here the function will materialize in the
     * DOM as a `<script> function here </script>` tag and the
     * function will be inside it
     * @param argValues An array with the VALUES of the arguments defined in the function. Note that you must pass the array according to the actual parameters of the function.
     */
    call(...argValues) {
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
        if (this.keep == false)
            fn.remove();
    }
    argValuesStr(...argValues) {
        var argValuesStr = '';
        for (var a = 0; a < argValues.length; a++)
            argValuesStr += `'${argValues[a]}', `;
        if (argValuesStr.endsWith(', '))
            argValuesStr = argValuesStr.substring(0, argValuesStr.length - 2);
        return argValuesStr;
    }
    argNamesStr() {
        var argNamesStr = '';
        for (var a = 0; a < this.functionArgs.length; a++)
            argNamesStr += `${this.functionArgs[a]}, `;
        if (argNamesStr.endsWith(', '))
            argNamesStr = argNamesStr.substring(0, argNamesStr.length - 2);
        return argNamesStr;
    }
}
/**
 * A class that generates a simplified,
 * standard Exception view at the point on
 * the page where an error occurred
 */
class DefaultExceptionPage {
    constructor(error) {
        if (UIPage.DISABLE_EXCEPTION_PAGE)
            return;
        var errorsStr = `${error.stack}`.split('\n');
        var title = `${error}`;
        var paneId = Widget.generateUUID();
        var rawHtml = `<div id="exceptionPane_${paneId}">`;
        rawHtml += `<img style="padding-left:30px; padding-top: 80px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAHYAAAB2AH6XKZyAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABFZJREFUeJztm0GLFEcUx/+vpzurQhaVCKJB/QSehJwjgrCzB4egm4PsIcJOEslNkNw8GQQ9Rp0h5GhcJQ4kuKeQfAEvCehRHNwNaxDUJbqZme56Ocz2Tk93VXXPdndZ7PaD3enueq/q/V6/elU9vQtUUkkllVSyc4VUDVfX/FlitFjgEBgIf1hEjll2zGM6Sj0xfh08/FDZAZvnK4KpefUT92ERAXBUDZbCA4zDDvPtIuC1AbAUPmz/uPQAWAy/2WYkAFbCmwrAdocH9DXAWng2OgVshDc2BWyFNxEAq+HfzxSwB95YDbAW3uwU2L7wQOoUsBTezBSwF95IDbAa3kwGyJ20At5kALYzPLCVnaAN8CYywGb4IpMg+xSwCd5EBuwEeCDLFLAR3lQGbHd4AHCVLebg/2OgVRN8p+d7j6+fprfFIupFGQBD8MsUiPp3p6b+Kh4tm6gzwMCdF8yz194jPJBlGYwcFznnGWhdO/nBnyUwTSTaDCiz4NUE34kO9+1v/iwLbjE23khhpJsshKxpi10XtAKm5vXP5O8S1ctgifBgwHO8J2PjlQE//HUYpH6XOPHTYBHwzMCVT+nf2HDFw4fXwMp3iRM9DRYFP3IsNp4KJOx4S/B6yfw0GPpQCLzKuYiuAH4PhHuMAvcohFhKh+elAP4RDoJjzPhD2q9Esu0DDMMzACHcL27UqQsAC4/4zL5Vf5GZG3J46rx54c21mzQAgEu/rF+AX3uaBg9kqQFlwGuCEAK6YqTVPkGDVwfdOQZ15PDuJjwAuMFGa4ZpoA+ADi4HvNSvWGoz9W8tPGIvbG6foMGbv905cDQISfiFFns+nO/z14Ay4SXOjac2A6CZvav9zjdLPBXqtJs0eNZzzxJwlwU9kMFPH/AXIWgm2fmEATD+PB+FH93h+q7A/2mhNcqE++coeL3qza/9434uhWduZIUHit4HQK6vrNyJMVliw429h5KZUAQ8UOQ+AHL9fPAbp4Lquwf9n6NBCCUPPFDUPkChr4SXOZdiI4TT6z2HiJu92gcB5p60r/A0dw2In+eEV/qjsGFBD+JzPpT75yjoBt55AHfHxolyaCTfPgDYGrwiA+Q21JEVvHhhXHvpzUNQZ6zL3DUAhuAht9EtddMfJQtjl92zoGEmZIEHtroPAPLBy7yL2RDzQ/1SR/Wp9eQSufbSm2fmzH9HPPk+AMgPr7o7ERsfwVfpSx03pvf7i9EgtJs0gCMuSvuVyGT7AMAIfFxFu9RRMgjSfhWS+qVoKfCaIIQ2DtwfL99bv+DXQOT0b2q3t8SND/f3O5fvrX/t10AIaj+ANONERP+dYEnwUr+iNkOFU4Fb6xKAxOof62BYUqjuU60LAWSFB7LUgNC5IuFVNZAlbSnn0mqf1kdEdDVgJTQuA/7Kr7xnbDxBKyXCP5doAtD+xwg1wVgu5c4z8I4Hx8cdpSZAyykgo9PM8LTMcL6UaFdSSSWVVLLj5X+IDiuFkg1oQQAAAABJRU5ErkJggg==" />`;
        rawHtml += `<h4 style="padding-left:30px"> ${title} </h4>`;
        rawHtml += `<p style="padding-left:30px; font-size: 20px">`;
        for (var i = 0; i < errorsStr.length; i++) {
            var erro = errorsStr[i];
            var msg = erro.trim();
            if (msg.indexOf('at') == 0) {
                var codePath = msg.substring(3, msg.indexOf('('));
                codePath = codePath.trim();
                msg = msg.replace(codePath, `<span class="badge badge-secondary"> ${codePath} </span>`);
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
class UIHeadBinder extends WidgetBinder {
    constructor(head) {
        super(head);
        this.head = head;
    }
    getWidgetValue() {
        return this.head.value();
    }
    refreshUI() {
        var propValue = this.getModelPropertyValue();
        this.head.setText(`${propValue}`);
    }
    fillPropertyModel() { }
}
class UIHead extends Widget {
    constructor({ name, headType, text }) {
        super(name);
        if (headType == '' || headType == null || headType == undefined)
            headType = 'H1';
        this.textContent = text;
        this.headType = headType
            .replace('<', '')
            .replace('/', '')
            .replace('>', '');
    }
    getBinder() {
        return new UIHeadBinder(this);
    }
    htmlTemplate() {
        return `<${this.headType} id="fsHead"> </${this.headType}>`;
    }
    onWidgetDidLoad() {
        this.headElement = this.elementById('fsHead');
        this.headElement.textContent = this.textContent;
    }
    setCustomPresenter(presenter) {
        presenter.render(this);
    }
    setText(text) {
        this.headElement.textContent = text;
    }
    value() {
        return this.headElement.textContent;
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.headElement.classList.add(className);
    }
    removeCSSClass(className) {
        this.headElement.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.headElement.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.headElement.style.position = position;
        this.headElement.style.left = marginLeft;
        this.headElement.style.top = marginTop;
        this.headElement.style.right = `${marginRight}`;
        this.headElement.style.bottom = `${marginBottom}`;
        this.headElement.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.headElement.hidden = (visible == false);
    }
}
class ModalAction {
    constructor(buttonText, dataDismiss, buttonClick, ...buttonClasses) {
        this.text = buttonText;
        this.classes = buttonClasses;
        this.onClick = buttonClick;
        this.dismis = dataDismiss;
        if (this.text == null)
            this.text = 'Modal action';
        if (this.classes == null || this.classes.length == 0)
            this.classes = ['btn', 'btn-primary'];
    }
    setButton(button, modal) {
        var self = this;
        if (Misc.isNull(this.onClick) == false)
            button.onclick = function () {
                self.onClick(modal);
            };
    }
}
class RadioOption {
    constructor(text, value, fieldSetId, shell) {
        var template = new UITemplateView(`<div id="radioOptionContainer" style="margin-right: 10px" class="custom-control custom-radio">
    <input id="radioInput" type="radio" name="fieldset" class="custom-control-input">
    <label id="radioLabel" class="custom-control-label font-weight-normal" for=""> Radio Option </label>
</div>
`, shell);
        this.optionContainer = template.elementById('radioOptionContainer');
        this.radioInput = template.elementById('radioInput');
        this.radioLabel = template.elementById('radioLabel');
        this.radioLabel.textContent = text;
        this.radioInput.value = value;
        this.radioInput.name = fieldSetId;
        this.radioLabel.htmlFor = this.radioInput.id;
    }
    isChecked() {
        return this.radioInput.checked;
    }
    value() {
        return this.radioInput.value;
    }
    setChecked(isChecked) {
        this.radioInput.checked = isChecked;
    }
    setEnabled(isEnabled) {
        this.radioInput.disabled = (isEnabled == false);
    }
}
class UIRadioGroupBinder extends WidgetBinder {
    constructor(radioGroup) {
        super(radioGroup);
        this.radioGp = radioGroup;
    }
    getWidgetValue() {
        return this.radioGp.value();
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.radioGp.setValue(value);
    }
    fillPropertyModel() {
        var value = this.getWidgetValue();
        this.setModelPropertyValue(value);
    }
}
class UIRadioGroup extends Widget {
    /**
    *
    * @param direction Flex direction: 'column' / 'row'
    * @param options array { t:'Option Text', v: 'option_value' }
    */
    constructor({ name, title = '', orientation = 'vertical', options = [] }) {
        super(name);
        this.options = [];
        this.initialOptions = [];
        this.title = title;
        this.orientation = orientation;
        this.initialOptions = options;
    }
    getBinder() {
        return new UIRadioGroupBinder(this);
    }
    onWidgetDidLoad() {
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
    htmlTemplate() {
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
    addOptions(options) {
        for (var i = 0; i < options.length; i++) {
            var op = options[i];
            this.addOption(op.t, op.v);
        }
    }
    addOption(text, value) {
        var newOpt = new RadioOption(text, value, this.fieldSet.id, this.getPageShell());
        this.options.push(newOpt);
        this.fieldSet.appendChild(newOpt.optionContainer);
    }
    fromList(models, textKey, valueKey) {
        for (var i = 0; i < models.length; i++) {
            var model = models[i];
            var text = model[textKey];
            var value = model[valueKey];
            this.addOption(text, value);
        }
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    selectedOption() {
        for (var i = 0; i < this.options.length; i++)
            if (this.options[i].isChecked())
                return this.options[i];
    }
    setValue(value) {
        for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].value() == value)
                this.options[i].setChecked(true);
            else
                this.options[i].setChecked(false);
        }
    }
    value() {
        for (var i = 0; i < this.options.length; i++) {
            var op = this.options[i];
            if (op.isChecked())
                return op.value();
        }
        return '';
    }
    setEnabled(enabled) {
        for (var i = 0; i < this.options.length; i++) {
            var op = this.options[i];
            op.setEnabled(enabled);
        }
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.groupContainer.style.position = position;
        this.groupContainer.style.left = marginLeft;
        this.groupContainer.style.top = marginTop;
        this.groupContainer.style.right = marginRight;
        this.groupContainer.style.bottom = marginBottom;
        this.groupContainer.style.transform = transform;
    }
    setVisible(visible) {
        this.groupContainer.hidden = (visible == false);
    }
}
class UIButton extends Widget {
    constructor({ name, text, imageSrc, imageWidth, btnClass = 'btn-light' }) {
        super(name);
        this.imageSrc = imageSrc;
        this.imageWidth = imageWidth;
        this.text = text;
        this.btnClass = btnClass;
    }
    htmlTemplate() {
        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined) {
            return `
<button id="fsButton" type="button" style="height: 35px" class="btn btn-block"> 
     <img alt="img" id="fsButtonImage" src="/icons/sb_menu.png" width="20" ></img> 
</button>`;
        }
        else
            return `<button id="fsButton" type="button" style="height: 35px" class="btn btn-block">Button</button>`;
    }
    onWidgetDidLoad() {
        var self = this;
        this.buttonElement = this.elementById('fsButton');
        this.buttonElement.classList.add(this.btnClass);
        this.imageElement = this.elementById('fsButtonImage');
        this.setText(this.text);
        if (self.onClick != null) {
            this.buttonElement.onclick = function (ev) {
                self.onClick(ev);
            };
        }
    }
    setText(text) {
        this.buttonElement.innerText = text;
        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined) {
            this.imageElement.src = this.imageSrc;
            this.imageElement.width = this.imageWidth;
            this.buttonElement.appendChild(this.imageElement);
        }
    }
    value() {
        throw new Error("Button does not support value");
    }
    setVisible(visible) {
        this.buttonElement.hidden = (visible == false);
    }
    setEnabled(enabled) {
        this.buttonElement.disabled = (enabled == false);
    }
    addCSSClass(className) {
        this.buttonElement.classList.add(className);
    }
    removeCSSClass(className) {
        this.buttonElement.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.buttonElement.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.buttonElement.style.position = position;
        this.buttonElement.style.left = marginLeft;
        this.buttonElement.style.top = marginTop;
        this.buttonElement.style.right = `${marginRight}`;
        this.buttonElement.style.bottom = `${marginBottom}`;
        this.buttonElement.style.transform = `${transform}`;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
}
class UICheckBoxBinder extends WidgetBinder {
    constructor(checkBox) {
        super(checkBox);
        this.checkBox = checkBox;
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.checkBox.setChecked(value);
    }
    fillPropertyModel() {
        var checked = this.checkBox.isChecked();
        this.setModelPropertyValue(checked);
    }
    getWidgetValue() {
        var checked = this.checkBox.isChecked();
        return checked;
    }
}
class UICheckBox extends Widget {
    constructor({ name, text }) {
        super(name);
        this.labelText = text;
    }
    getBinder() {
        return new UICheckBoxBinder(this);
    }
    htmlTemplate() {
        return `
<div id="fsCheckBox" class="custom-control custom-checkbox">
  <input id="checkElement" class="custom-control-input" type="checkbox" value="">
  <label id="checkLabel" class="custom-control-label font-weight-normal" for="checkElement">
    Default checkbox
  </label>
</div>`;
    }
    onWidgetDidLoad() {
        var self = this;
        self.divContainer = self.elementById('fsCheckBox');
        self.checkElement = self.elementById('checkElement');
        self.checkLabel = self.elementById('checkLabel');
        self.checkLabel.htmlFor = self.checkElement.id;
        self.checkLabel.textContent = self.labelText;
        self.checkElement.onchange = function (ev) {
            if (self.onCheckedChange != null)
                self.onCheckedChange({ checked: self.checkElement.checked, event: ev });
        };
    }
    setText(text) {
        this.labelText = text;
        this.checkLabel.textContent = this.labelText;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return this.checkElement.checked.toString();
    }
    setEnabled(enabled) {
        this.checkElement.disabled = (enabled == false);
    }
    addCSSClass(className) {
        this.checkElement.classList.add(className);
    }
    removeCSSClass(className) {
        this.checkElement.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.checkElement.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.divContainer.hidden = (visible == false);
    }
    setChecked(isChecked) {
        this.checkElement.checked = isChecked;
    }
    isChecked() {
        return this.checkElement.checked;
    }
}
class UIImageBinder extends WidgetBinder {
    constructor(image) {
        super(image);
        this.img = image;
    }
    getWidgetValue() {
        return this.img.value();
    }
    refreshUI() {
        var valueModel = this.getModelPropertyValue();
        this.img.setSource(valueModel);
    }
    fillPropertyModel() { }
}
class UIImage extends Widget {
    constructor({ name, src, cssClass, alt }) {
        super(name);
        if (cssClass == null)
            cssClass = 'img-fluid';
        this.imgCssClass = cssClass;
        this.imgSrc = src;
        this.imgAlt = `${alt}`;
    }
    getBinder() {
        return new UIImageBinder(this);
    }
    htmlTemplate() {
        return `<img id="fsImageView" src="" class="img-fluid" alt="">`;
    }
    onWidgetDidLoad() {
        this.image = this.elementById('fsImageView');
        this.image.alt = this.imgAlt;
        this.setSource(this.imgSrc);
        this.addCSSClass(this.imgCssClass);
    }
    setSource(imgSource) {
        this.imgSrc = imgSource;
        this.image.src = this.imgSrc;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return this.imgSrc;
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.image.classList.add(className);
    }
    removeCSSClass(className) {
        this.image.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.image.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.image.style.position = position;
        this.image.style.left = marginLeft;
        this.image.style.top = marginTop;
        this.image.style.right = marginRight;
        this.image.style.bottom = marginBottom;
        this.image.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.image.hidden = (visible == false);
    }
}
class UILabelBinder extends WidgetBinder {
    constructor(label) {
        super(label);
        this.label = label;
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.label.setText(`${value}`);
    }
    fillPropertyModel() {
        var text = this.label.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue() {
        var text = this.label.getText();
        return text;
    }
}
class UILabel extends Widget {
    constructor({ name, text }) {
        super(name);
        this.lblText = text;
    }
    getBinder() {
        return new UILabelBinder(this);
    }
    htmlTemplate() {
        return `<label id="fsLabel" class="label"> Default label </label>`;
    }
    onWidgetDidLoad() {
        this.label = this.elementById('fsLabel');
        this.label.textContent = this.lblText;
    }
    getText() {
        return this.value();
    }
    setText(text) {
        this.label.textContent = text;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return `${this.label.textContent}`;
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.label.classList.add(className);
    }
    removeCSSClass(className) {
        this.label.classList.add(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.label.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.label.style.position = position;
        this.label.style.left = marginLeft;
        this.label.style.top = marginTop;
        this.label.style.right = marginRight;
        this.label.style.bottom = marginBottom;
        this.label.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.label.hidden = (visible == false);
    }
}
class UIListBinder extends WidgetBinder {
    constructor(listView) {
        super(listView);
        this.listView = listView;
    }
    refreshUI() {
        var viewModels = this.getModelPropertyValue();
        this.listView.fromList(viewModels, this.valueProperty, this.displayProperty);
    }
    getWidgetValue() {
        var item = this.listView.selectedItem();
        if (item == null)
            return null;
        return item.value;
    }
    fillPropertyModel() { }
}
class UIList extends Widget {
    /**
     *
     * @param itemClicked Function to handle onClick item event.
     *
     * Parameters: **(item: IListItemTemplate, ev: Event)**
     */
    constructor({ name, itemClicked = null, templateProvider = null }) {
        super(name);
        this.items = [];
        this.customBehaviorColors = false;
        this.unSelectedBackColor = null;
        this.unSelectedForeColor = null;
        this.selectedBackColor = null;
        this.selectedForeColor = null;
        this.templateProvider = templateProvider;
        this.itemClickedCallback = itemClicked;
    }
    htmlTemplate() {
        return `
<div id="fsListView" class="list-group">
</div>`;
    }
    setTemplateProvider(itemTemplateProvider) {
        this.templateProvider = itemTemplateProvider;
    }
    /**
     * Changes the color selection behavior for each UIList item.
     *
     * NOTE: not every implementation of 'IListItemTemplate'
     * will be able to obey this
     */
    changeColors(selectedBack, selectedFore, unSelectedBack, unSelectedFore) {
        this.customBehaviorColors = true;
        this.selectedBackColor = selectedBack;
        this.selectedForeColor = selectedFore;
        this.unSelectedBackColor = unSelectedBack;
        this.unSelectedForeColor = unSelectedFore;
    }
    itemTemplateProvider() {
        return this.templateProvider;
    }
    getBinder() {
        return new UIListBinder(this);
    }
    fromList(viewModels, valueProperty, displayProperty) {
        if (viewModels == null || viewModels == undefined || viewModels.length == 0) {
            try {
                var templateProvider = this.itemTemplateProvider();
                if (templateProvider != null) {
                    var customItem = templateProvider.getListItemTemplate(this, null);
                    if (customItem != null && customItem != undefined)
                        this.addItem(customItem);
                }
            }
            catch (err) {
                console.error(err);
            }
            return;
        }
        ;
        this.divContainer.innerHTML = '';
        for (var i = 0; i < viewModels.length; i++) {
            var viewModel = viewModels[i];
            var text = (displayProperty == null ? `${viewModel}` : viewModel[displayProperty]);
            var value = (valueProperty == null ? `${viewModel}` : viewModel[valueProperty]);
            if (this.itemTemplateProvider() == null) {
                var defaultItemTemplate = new ListItem(`${i + 1}`, text, value);
                this.addItem(defaultItemTemplate);
            }
            else {
                var templateProvider = this.itemTemplateProvider();
                var customItem = templateProvider.getListItemTemplate(this, viewModel);
                this.addItem(customItem);
            }
        }
    }
    onWidgetDidLoad() {
        this.divContainer = this.elementById('fsListView');
    }
    onItemClicked(item, ev) {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
        if (this.itemClickedCallback != null && this.itemClickedCallback != undefined)
            this.itemClickedCallback(item, ev);
    }
    addItem(item) {
        item.setOwnerList(this);
        this.items.push(item);
        var view = item.itemTemplate();
        this.divContainer.append(view);
        return this;
    }
    removeItem(item) {
        for (var i = 0; i < this.divContainer.children.length; i++) {
            var view = this.divContainer.children[i];
            if (view.id == item.itemName) {
                var indx = this.items.indexOf(item);
                if (indx >= 0)
                    this.items.splice(indx, 1);
                this.divContainer.removeChild(view);
                item = null;
                return;
            }
        }
    }
    setSelectedValue(itemValue) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.value == itemValue)
                item.select();
            else
                item.unSelect();
        }
    }
    setSelectedItem(selectedItem) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            item.unSelect();
        }
        selectedItem.select();
    }
    selectedItem() {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.isSelected())
                return item;
        }
        return null;
    }
    selectedValue() {
        var sItem = this.selectedItem();
        if (sItem == null || sItem == undefined)
            return null;
        return sItem.value;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return this.selectedValue();
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.divContainer.classList.add(className);
    }
    removeCSSClass(className) {
        this.divContainer.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.divContainer.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    setVisible(visible) {
        this.divContainer.hidden = (visible == false);
    }
}
class UIDialog extends Widget {
    constructor({ shell, name, title, contentTemplate, actions }) {
        super(name);
        this.modalActions = [];
        this.shell = shell;
        this.titleText = title;
        this.contentTemplate = contentTemplate;
        this.modalActions = actions;
        var body = shell.getPageBody();
        var modalDivContainer = shell.elementById('modalContainer');
        if (modalDivContainer == null) {
            modalDivContainer = shell.createElement('div');
            modalDivContainer.id = 'modalContainer';
            body.appendChild(modalDivContainer);
        }
        this.modalContext = new WidgetContext(shell, [modalDivContainer.id], null);
    }
    htmlTemplate() {
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
    onWidgetDidLoad() {
        var self = this;
        self.titleElement = self.elementById('modalTitle');
        self.bodyContainer = self.elementById('modalBody');
        self.footerContainer = self.elementById('modalFooter');
        self.titleElement.textContent = self.titleText;
        self.modalContainer = self.elementById('fsModalView');
        self.bodyContainer.appendChild(self.contentTemplate.content());
        for (var i = 0; i < self.modalActions.length; i++) {
            const action = self.modalActions[i];
            const btn = self.shell.createElement('button');
            btn.type = 'button';
            btn.id = `modalAction_${Widget.generateUUID()}`;
            btn.textContent = action.text;
            for (var c = 0; c < action.classes.length; c++)
                btn.classList.add(action.classes[c]);
            action.setButton(btn, this);
            if (action.dismis)
                btn.setAttribute('data-dismiss', 'modal');
            self.footerContainer.appendChild(btn);
        }
        self.showFunction = new VirtualFunction({
            fnName: 'modalShow',
            fnArgNames: [],
            keepAfterCalled: true
        });
        self.showFunction.setContent(`
            var md = new bootstrap.Modal(document.getElementById('${self.modalContainer.id}'), { backdrop: false })
            md.show();
            $('#${self.modalContainer.id}').on('hidden.bs.modal', function (e) {
                document.getElementById('${self.modalContainer.id}').remove();
                document.getElementById('${self.showFunction.functionId}').remove();
            })`);
        self.showFunction.call();
    }
    show() {
        this.modalContext.addWidget('modalContainer', this);
        this.modalContext.build(this, false);
        UIDialog.$ = this;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
class UINavBar extends Widget {
    constructor(name) {
        super(name);
    }
    htmlTemplate() {
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
</nav>`;
    }
    onWidgetDidLoad() {
        this.navBar = this.elementById('fsNavbar');
        this.leftLinks = this.elementById('navLeftLinks');
        this.rightLinks = this.elementById('navRightLinks');
        this.brandText = this.elementById('brandText');
        this.pushMenuButton = this.elementById('btnPushMenu');
        this.pushMenuButton.style.marginLeft = '5px';
        this.brandText.style.marginLeft = '10px';
        this.navBar.style.boxShadow = '0 0 1em lightgray';
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    value() {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.navBar.classList.add(className);
    }
    removeCSSClass(className) {
        this.navBar.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.navBar.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.navBar.style.position = position;
        this.navBar.style.left = marginLeft;
        this.navBar.style.top = marginTop;
        this.navBar.style.right = marginRight;
        this.navBar.style.bottom = marginBottom;
        this.navBar.style.transform = transform;
    }
    setVisible(visible) {
        this.navBar.hidden = (visible == false);
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
}
class UIProgressBar extends Widget {
    onWidgetDidLoad() {
        throw new Error("Method not implemented.");
    }
    htmlTemplate() {
        throw new Error("Method not implemented.");
    }
    setCustomPresenter(renderer) {
        throw new Error("Method not implemented.");
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
class UISelectBinder extends WidgetBinder {
    constructor(select) {
        super(select);
        this.select = select;
    }
    getWidgetValue() {
        return this.select.value();
    }
    refreshUI() {
        var models = this.getModelPropertyValue();
        if (this.bindingHasPath)
            this.select.fromList(models, this.valueProperty, this.displayProperty);
        else
            this.select.fromList(models);
    }
    fillPropertyModel() { }
}
class UISelect extends Widget {
    constructor({ name, title }) {
        super(name);
        this.divContainer = null;
        this.title = null;
        this.select = null;
        this.onSelectionChanged = null;
        this.initialTitle = null;
        this.initialTitle = title;
    }
    htmlTemplate() {
        return `
<div id="fsSelect" class="form-group">
    <label id="selectTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="selectEl"> Select Title </label>
    <select style="height: 35px" id="selectEl" class="form-control">
    </select>
</div>`;
    }
    getBinder() {
        return new UISelectBinder(this);
        ;
    }
    onWidgetDidLoad() {
        var self = this;
        this.divContainer = this.elementById('fsSelect');
        this.title = this.elementById('selectTitle');
        this.select = this.elementById('selectEl');
        this.select.onchange = function (ev) {
            if (self.onSelectionChanged != null)
                self.onSelectionChanged(ev);
        };
        this.title.textContent = this.initialTitle;
    }
    setSelectedOption(optionValue) {
        try {
            for (var i = 0; i < this.select.options.length; i++)
                this.select.options[i].selected = false;
            for (var i = 0; i < this.select.options.length; i++) {
                var option = this.select.options[i];
                if (option.value == optionValue) {
                    option.selected = true;
                    return;
                }
            }
        }
        catch (error) {
            this.processError(error);
        }
    }
    fromList(models, valueProperty, displayProperty) {
        if (models == null || models == undefined)
            return;
        try {
            var optionsFromModels = [];
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                var option = null;
                if (valueProperty != null && valueProperty != undefined)
                    option = new SelectOption(model[valueProperty], model[displayProperty]);
                else
                    option = new SelectOption(`${models[i]}`, `${models[i]}`);
                optionsFromModels.push(option);
            }
            this.addOptions(optionsFromModels);
        }
        catch (error) {
            this.processError(error);
        }
    }
    addOptions(options) {
        this.select.innerHTML = '';
        for (var i = 0; i < options.length; i++)
            this.addOption(options[i]);
    }
    addOption(option) {
        try {
            var optionEL = document.createElement('option');
            optionEL.value = option.value;
            optionEL.textContent = option.text;
            this.select.add(optionEL);
            return this;
        }
        catch (error) {
            this.processError(error);
        }
    }
    setTitle(title) {
        this.title.textContent = title;
    }
    setCustomPresenter(renderer) {
        try {
            renderer.render(this);
        }
        catch (error) {
            this.processError(error);
        }
    }
    value() {
        return this.select.value;
    }
    addCSSClass(className) {
        this.select.classList.add(className);
    }
    removeCSSClass(className) {
        this.select.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.select.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    setVisible(visible) {
        this.divContainer.hidden = (visible == false);
    }
    setEnabled(enabled) {
        this.select.disabled = (enabled == false);
    }
}
class UISpinner extends Widget {
    constructor({ name, colorClass, visible = true }) {
        super(name);
        this.containerDiv = null;
        this.spanSpinner = null;
        this.colorCls = colorClass;
        this.initialVisible = visible;
    }
    onWidgetDidLoad() {
        this.containerDiv = this.elementById('container');
        this.spanSpinner = this.elementById('spnSpinner');
        this.setVisible(this.initialVisible);
    }
    htmlTemplate() {
        var colorClass = this.colorCls;
        if (colorClass == 'primary')
            colorClass = 'text-primary';
        if (colorClass == '')
            colorClass = 'text-primary';
        return `
<div id="container" class="spinner-border ${colorClass}" role="status">
    <span id="spnSpinner" class="sr-only"/>
</div>
        `;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return null;
    }
    setEnabled(enabled) {
    }
    addCSSClass(className) {
    }
    removeCSSClass(className) {
    }
    applyCSS(propertyName, propertyValue) {
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
    }
    setVisible(visible) {
        this.containerDiv.hidden = (visible == false);
    }
}
class UISwitcher extends Widget {
    onWidgetDidLoad() {
        throw new Error("Method not implemented.");
    }
    htmlTemplate() {
        throw new Error("Method not implemented.");
    }
    setCustomPresenter(renderer) {
        throw new Error("Method not implemented.");
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
class Mask {
    static array() {
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
/** 00/00/0000 */
Mask.DATE = '00/00/0000';
/**00:00:00 */
Mask.TIME = '00:00:00';
/**00/00/0000 00:00:00 */
Mask.DATE_TIME = '00/00/0000 00:00:00';
/**00000-000 */
Mask.CEP = '00000-000';
/**0000-0000 */
Mask.PHONE = '0000-0000';
/** (00) 0000-0000*/
Mask.PHONE_DDD = '(00) 0000-0000';
/**(000) 000-0000 */
Mask.PHONE_US = '(000) 000-0000';
/**000.000.000-00 */
Mask.CPF = '000.000.000-00';
/**00.000.000/0000-00 */
Mask.CNPJ = '00.000.000/0000-00';
/**000.000.000.000.000,00 */
Mask.MONEY = '000.000.000.000.000,00';
/**#.##0,00 */
Mask.MONEY2 = '#.##0,00';
/**099.099.099.099 */
Mask.IP_ADDRESS = '099.099.099.099';
/**##0,00% */
Mask.PERCENT = '##0,00%';
class UITextBoxBinder extends WidgetBinder {
    constructor(textBox) {
        super(textBox);
        this.textBox = this.widget;
    }
    refreshUI() {
        var value = this.getModelPropertyValue();
        this.textBox.setText(`${value}`);
    }
    fillPropertyModel() {
        var text = this.textBox.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue() {
        var text = this.textBox.getText();
        return text;
    }
}
class UITextBox extends Widget {
    constructor({ name, type = 'text', title = '', maxlength = 100, placeHolder = '', text = '' }) {
        super(name);
        this.initialTitle = null;
        this.initialPlaceHolder = null;
        this.initialText = null;
        this.initialType = null;
        this.initialMaxlength = null;
        this.lbTitle = null;
        this.txInput = null;
        this.divContainer = null;
        this.initialType = (Misc.isNullOrEmpty(type) ? 'text' : type);
        this.initialTitle = (Misc.isNullOrEmpty(title) ? '' : title);
        this.initialPlaceHolder = (Misc.isNullOrEmpty(placeHolder) ? '' : placeHolder);
        this.initialText = (Misc.isNullOrEmpty(text) ? '' : text);
        this.initialMaxlength = (Misc.isNullOrEmpty(maxlength) ? 100 : maxlength);
    }
    htmlTemplate() {
        return `
<div id="textEntry" class="form-group">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <input id="entryInput" class="form-control form-control-sm"  placeholder="Entry placeholder">
</div>`;
    }
    setEnabled(enabled) {
        this.txInput.disabled = (enabled == false);
    }
    getBinder() {
        return new UITextBoxBinder(this);
    }
    applyMask(maskPattern) {
        //making jQuery call
        var jQueryCall = `$('#${this.txInput.id}').mask('${maskPattern}'`;
        var a = Mask.array();
        var hasReverseFields = ((a.indexOf(Mask.CPF) +
            a.indexOf(Mask.CNPJ) +
            a.indexOf(Mask.MONEY) +
            a.indexOf(Mask.MONEY2)) >= 0);
        if (hasReverseFields)
            jQueryCall += ', {reverse: true});';
        else
            jQueryCall += ');';
        var maskFunction = new VirtualFunction({
            fnName: 'enableMask',
            fnContent: jQueryCall
        });
        maskFunction.call();
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    setInputType(inputType) {
        this.txInput.type = inputType;
    }
    onWidgetDidLoad() {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('textEntry');
        this.lbTitle.innerText = this.initialTitle;
        this.txInput.placeholder = this.initialPlaceHolder;
        this.txInput.value = this.initialText;
        this.setMaxLength(this.initialMaxlength);
        this.setInputType(this.initialType);
    }
    setMaxLength(maxlength) {
        this.txInput.maxLength = maxlength;
    }
    removeLabel() {
        this.lbTitle.remove();
    }
    setPlaceholder(text) {
        this.txInput.placeholder = text;
    }
    getText() {
        return this.value();
    }
    setText(newText) {
        this.txInput.value = (Misc.isNullOrEmpty(newText) ? '' : newText);
    }
    setTitle(newTitle) {
        this.lbTitle.textContent = newTitle;
    }
    value() {
        return this.txInput.value;
    }
    addCSSClass(className) {
        this.txInput.classList.add(className);
    }
    removeCSSClass(className) {
        this.txInput.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.txInput.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    setVisible(visible) {
        this.divContainer.hidden = (visible == false);
    }
}
class UIToast extends Widget {
    onWidgetDidLoad() {
        throw new Error("Method not implemented.");
    }
    htmlTemplate() {
        throw new Error("Method not implemented.");
    }
    setCustomPresenter(renderer) {
        throw new Error("Method not implemented.");
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
class DataGridItem {
    constructor(name, model, pageShell) {
        this.selected = false;
        this.pageShell = pageShell;
        this.itemName = name;
        this.value = model;
    }
    setOwnerDataGrid(dataGrid) {
        this.ownerDatagrid = dataGrid;
    }
    isSelected() {
        return this.selected;
    }
    select() {
        this.selected = true;
        this.rowElement.style.background = this.ownerDatagrid.selectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.selectedForeColor;
    }
    unSelect() {
        this.selected = false;
        this.rowElement.style.background = this.ownerDatagrid.unselectedBackColor;
        this.rowElement.style.color = this.ownerDatagrid.unselectedForeColor;
    }
    itemTemplate() {
        var self = this;
        if (self.rowElement != null)
            return self.rowElement;
        var model = self.value;
        var tr = self.pageShell.createElement('tr');
        for (var k = 0; k < this.ownerDatagrid.MODEL_KEYS.length; k++) {
            var key = this.ownerDatagrid.MODEL_KEYS[k];
            var td = this.pageShell.createElement('td');
            td.innerText = model[key];
            tr.appendChild(td);
        }
        tr.onclick = function (ev) {
            self.ownerDatagrid.onRowClick(self);
        };
        self.rowElement = tr;
        return tr;
    }
}
class ListItem {
    constructor(name, text, value, imageSrc = null, badgeText = null) {
        this.selected = false;
        this.value = value;
        this.itemName = name;
        this.itemText = text;
        this.itemImageSource = imageSrc;
        this.itemBadgeText = badgeText;
    }
    setImg(src) {
        if (Misc.isNullOrEmpty(src)) {
            this.imgElement.hidden = true;
            this.imgElement.width = 0;
        }
        else {
            if (this.imgElement.hidden == true)
                this.imgElement.hidden = false;
            if (this.imgElement.width == 0)
                this.imgElement.width = 30;
            this.imgElement.src = src;
        }
    }
    setText(text) {
        this.divElement.textContent = text;
    }
    setBadgeText(badgeText) {
        this.badgeElement.textContent = badgeText;
    }
    setOwnerList(listView) {
        this.ownerList = listView;
    }
    isSelected() {
        return this.selected;
    }
    select() {
        this.selected = true;
        if (this.ownerList.customBehaviorColors) {
            this.anchorElement.style.color = this.ownerList.selectedForeColor;
            this.anchorElement.style.backgroundColor = this.ownerList.selectedBackColor;
        }
        else
            this.anchorElement.classList.add('active');
    }
    unSelect() {
        this.selected = false;
        if (this.ownerList.customBehaviorColors) {
            this.anchorElement.style.color = this.ownerList.unSelectedForeColor;
            this.anchorElement.style.backgroundColor = this.ownerList.unSelectedBackColor;
        }
        else
            this.anchorElement.classList.remove('active');
    }
    itemTemplate() {
        var self = this;
        if (self.anchorElement != null)
            return self.anchorElement;
        var pageShell = self.ownerList.getPageShell();
        self.anchorElement = pageShell.createElement('a');
        self.anchorElement.style.padding = '0px';
        self.anchorElement.classList.add('list-group-item', 'align-items-center', 'list-group-item-action');
        self.anchorElement.id = this.itemName;
        self.anchorElement.onclick = function (ev) {
            self.ownerList.onItemClicked(self, ev);
        };
        var rowDiv = pageShell.createElement('div');
        rowDiv.style.background = 'transparent';
        rowDiv.style.height = '40px';
        rowDiv.style.marginTop = '10px';
        rowDiv.classList.add('row');
        var col10Div = pageShell.createElement('div');
        col10Div.style.paddingLeft = '25px';
        col10Div.classList.add('col-10');
        var img = null;
        if (this.itemImageSource != null) {
            img = pageShell.createElement('img');
            img.src = this.itemImageSource;
            img.style.marginRight = '10px';
            img.width = 30;
            img.height = 30;
            col10Div.append(img);
        }
        col10Div.append(this.itemText);
        rowDiv.append(col10Div);
        var badgeSpan = null;
        if (this.itemBadgeText != null) {
            var col2Div = pageShell.createElement('div');
            col2Div.style.display = 'flex';
            col2Div.style.justifyContent = 'end';
            col2Div.style.alignSelf = 'center';
            col2Div.classList.add('col-2');
            badgeSpan = pageShell.createElement('span');
            badgeSpan.classList.add('badge', 'badge-success', 'badge-pill');
            badgeSpan.textContent = this.itemBadgeText;
            badgeSpan.style.marginRight = '10px';
            col2Div.append(badgeSpan);
            rowDiv.append(col2Div);
        }
        self.anchorElement.append(rowDiv);
        self.badgeElement = badgeSpan;
        self.imgElement = img;
        self.divElement = rowDiv;
        this.unSelect();
        return self.anchorElement;
    }
}
class UITemplateView {
    constructor(htmlContent, shell) {
        this.shellPage = shell;
        this.viewDictionary = [];
        //  this.parentFragment.clear();
        var html = htmlContent;
        var parser = new DOMParser();
        var domObj = parser.parseFromString(html, "text/html");
        var allIds = domObj.querySelectorAll('*[id]');
        for (var i = 0; i < allIds.length; i++) {
            var element = allIds[i];
            var currentId = element.getAttribute('id');
            if (currentId != null) {
                var newId = `${currentId}_${Widget.generateUUID()}`;
                this.addDictionaryEntry(currentId, newId);
                element.setAttribute('id', newId);
            }
        }
        this.templateDOM = domObj;
        this.templateString = domObj.children[0].outerHTML;
    }
    content() {
        return this.templateDOM.children[0];
    }
    elementById(elementId) {
        for (var i = 0; i < this.viewDictionary.length; i++) {
            var entry = this.viewDictionary[i];
            if (entry.getOriginalId() == elementId) {
                var elementResult = this.templateDOM.getElementById(entry.getManagedId());
                return elementResult;
            }
        }
        return null;
    }
    addDictionaryEntry(originalId, generatedId) {
        var entry = new ViewDictionaryEntry(originalId, generatedId);
        this.viewDictionary.push(entry);
    }
}
class DataGridColumnDefinition {
}
class UIDataGridBinder extends WidgetBinder {
    constructor(dataGrid) {
        super(dataGrid);
        this.dataGrid = dataGrid;
    }
    getWidgetValue() {
        return this.dataGrid.selectedValue();
    }
    refreshUI() {
        var viewModels = this.getModelPropertyValue();
        this.dataGrid.fromList(viewModels);
    }
    fillPropertyModel() { }
}
class UIDataGrid extends Widget {
    constructor({ name, autoGenCols = false, itemTemplateProvider = null }) {
        super(name);
        this.selectedBackColor = '#007BFF';
        this.unselectedBackColor = '#FFFFFF';
        this.selectedForeColor = '#FFFFFF';
        this.unselectedForeColor = '#000000';
        this.items = [];
        this.MODEL_KEYS = [];
        this.templateProvider = itemTemplateProvider;
        this.autoGenerateColumns = autoGenCols;
    }
    getBinder() {
        return new UIDataGridBinder(this);
    }
    /**
     *
     * @param colDefs array of { h: 'Column Header', k: 'model_property_name' }
     */
    addColumns(colDefs) {
        this.table.tHead.innerHTML = '';
        for (var i = 0; i < colDefs.length; i++) {
            var def = colDefs[i];
            this.addColumn(def.h, def.k);
        }
    }
    addColumn(columnHeader, modelKey) {
        var shell = this.getPageShell();
        this.MODEL_KEYS.push(modelKey);
        var thead = this.table.tHead;
        if (thead.childNodes.length == 0)
            thead.appendChild(shell.createElement('tr'));
        var th = shell.createElement('th', columnHeader);
        th.scope = 'col';
        thead.children[0].appendChild(th);
    }
    generateColumns(list) {
        this.autoGenerateColumns = false;
        this.table.tHead.innerHTML = '';
        this.MODEL_KEYS = [];
        var shell = this.getPageShell();
        //creating columns
        var tr = shell.createElement('tr');
        let firstModel = list[0];
        for (let key in firstModel) {
            var th = shell.createElement('th');
            th.scope = 'col';
            th.textContent = key;
            tr.appendChild(th);
            this.MODEL_KEYS.push(key);
        }
        this.table.tHead.appendChild(tr);
    }
    fromList(list) {
        if ((list == null || list == undefined) || list.length == 0)
            return;
        this.table.tBodies[0].innerHTML = '';
        this.items = [];
        var shell = this.getPageShell();
        if (this.autoGenerateColumns)
            this.generateColumns(list);
        //adding rows
        for (var i = 0; i < list.length; i++) {
            var model = list[i];
            var itemTemplate;
            if (this.templateProvider == null)
                itemTemplate = new DataGridItem(`default_datagrid_item_${i + 1}`, model, shell);
            else
                itemTemplate = this.templateProvider.getDataGridItemTemplate(this, model);
            itemTemplate.setOwnerDataGrid(this);
            this.items.push(itemTemplate);
            this.table.tBodies[0].appendChild(itemTemplate.itemTemplate());
        }
    }
    selectedItem() {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].isSelected())
                return this.items[i];
        return null;
    }
    selectedValue() {
        for (var i = 0; i < this.items.length; i++)
            if (this.items[i].isSelected())
                return this.items[i].value;
        return null;
    }
    setSelectedItem(item) {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
    }
    setSelectedValue(model) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.value == model)
                item.select();
            else
                item.unSelect();
        }
    }
    onRowClick(item) {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
    }
    htmlTemplate() {
        return `
<table id="fsDataGrid" class="table table-hover table-bordered table-sm">
  <thead id="gridHeader">
  </thead>
  <tbody id="gridBody" style="overflow-y:scrol; height: 100px">
  </tbody>
</table>        
`;
    }
    onWidgetDidLoad() {
        this.table = this.elementById('fsDataGrid');
        this.table.style.background = 'white';
        this.tableHeader = this.elementById('gridHeader');
        this.tableBody = this.elementById('gridBody');
    }
    setCustomPresenter(presenter) {
        presenter.render(this);
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
