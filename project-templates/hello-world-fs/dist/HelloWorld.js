"use strict";
/**
 * These imports mostly come from the "FrontStoreUI.ts" library,
 * which contains all the default widgets and mechanism for
 * basic screen controls.
 */
/**
 * An inheritance UIView class is able to represent a view and its controls.
 * Controls are represented in derived UIWidgets,
 * which are managed by the derived UIView
 */
class HelloWorld extends View {
    //#endregion
    constructor() {
        super();
        //#region  Widgets used in this view */
        this.img = new UIImage({ name: 'img', src: "/img/demo-img.png" });
        this.hello = new UIHead({ name: 'helloH1', headType: 'h1', text: 'Hello World!' });
        this.btnModal = new UIButton({ name: 'btnModal', btnClass: 'btn-success', text: 'Click to see it' });
        HelloWorld.$ = this;
        // Widget's events must be implemented in the derived UIView constructor
        this.btnModal.onClick = this.modalShow;
    }
    /**
     * After calling the constructor, the UIView (super) class takes
     * control of this class, and upon loading it (super) will call
     * some methods in the inherited class
     */
    /**
     * It is the first function invoked by UIView (super).
     * Here, you must define the divisions and demarcations of the layout.
     *
     * This is done under the ViewLayout class, which supports 2 input methods:
     * object and HTML string.
     */
    buildLayout() {
        // You can build the layout with representative objects (Row and Column)
        return new ViewLayout('app', [
            new Row('rowImg', {
                rowClass: 'row d-flex flex-row justify-content-center'
            }),
            new Row('rowHello', {
                rowClass: 'row d-flex flex-row justify-content-center',
                columns: [
                    new Col('colHello', { colClass: 'col-5' })
                ]
            })
        ]);
        // Or use an HTML string with the view layout definition
        return new ViewLayout('app')
            .fromHTML(`
            <div id="rowImg" class="row d-flex flex-row justify-content-center">
            </div>
            <div id="rowHello" class="row d-flex flex-row justify-content-center">
                <div id="colHello" class="col-5">
                </div>
            </div>
            `);
    }
    /**
     * It is the second function invoked by UIView (super) in the inherited class.
     *
     * Here, you must attach the widgets to the respective div's of
     * the layout in which they should appear
     * (it was previously built in buildLayout() function)
     */
    composeView() {
        this.addWidgets('rowImg', this.img);
        this.addWidgets('colHello', this.hello, this.btnModal);
    }
    /**
     * It is the third and last function invoked by UIView (super)
     *
     * At this point, the rendering of the view is complete and is
     * already visible on the page. You can change the widgets state here:
     * change text, apply styles, etc.
     */
    onViewDidLoad() {
        this.img.applyCSS('width', '370px');
        this.img.applyCSS('height', '250px');
        this.img.applyCSS('margin-top', '100px');
        this.hello.setText('Hello World! Its working :)');
        this.hello.applyCSS('color', 'darkorange');
        this.hello.applyCSS('width', '100%');
        this.hello.applyCSS('text-align', 'center');
        // or...
        // this.hello.cssFromString('color:darkorange');
    }
    //#region others general or specific functions pertinent to this class (inherited)
    modalShow(ev) {
        const template = HelloWorld.$.inflateTemplateView('<label id="lbHello"> Hello World! by FrontStoreUI </label>');
        const lbHello = template.elementById('lbHello');
        var modal = new UIDialog({
            title: 'Its works!',
            shell: HelloWorld.$.shellPage,
            name: 'hello-world-modal',
            contentTemplate: template,
            actions: [
                new ModalAction('Click to more surprise...', false, function (m) {
                    lbHello.textContent = 'Changed!';
                }, 'btn', 'btn-success'),
                new ModalAction('Close', true)
            ]
        });
        modal.show();
    }
}
