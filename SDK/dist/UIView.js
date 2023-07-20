"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIView = void 0;
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
    showDialog(title, text) {
        var diag = new UIDialog(this.shellPage)
            .setTitle(title)
            .setText(text)
            .action(new ModalAction({
            buttonText: 'Ok',
            dataDismiss: true
        }));
        diag.show();
    }
    createDialog(title) {
        var diag = new UIDialog(this.shellPage)
            .setTitle(title);
        return diag;
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
//exports.UIView = UIView;
