"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.Widget = //exports.WidgetFragment = //exports.WidgetMessage = //exports.WidgetContext = void 0;
//Object.defineProperty(exports, "WidgetFragment", { enumerable: true, get: function () { return WidgetFragment; } });
//Object.defineProperty(exports, "WidgetContext", { enumerable: true, get: function () { return WidgetContext; } });
//Object.defineProperty(exports, "WidgetMessage", { enumerable: true, get: function () { return WidgetMessage; } });
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
//exports.Widget = Widget;
