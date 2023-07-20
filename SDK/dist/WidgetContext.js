"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.WidgetContext = void 0;
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
    get(path) {
        const fragmentName = path.split('/')[0];
        const widgetName = path.split('/')[1];
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
    clear() {
        for (var i = 0; i < this.fragments.length; i++) {
            var fragment = this.fragments[i];
            fragment.clear();
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
//exports.WidgetContext = WidgetContext;
