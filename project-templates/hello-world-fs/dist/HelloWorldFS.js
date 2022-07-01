"use strict";
/**
 * These imports mostly come from the "FrontStoreUI.ts" library,
 * which contains all the default widgets and mechanism for
 * basic screen controls.
 */
/**
 * An inheritance FSView class is able to represent a view and its controls.
 * Controls are represented in derived FSWidgets,
 * which are managed by the derived FSView
 */
class HelloWorldFS extends FSView {
    //#endregion
    constructor() {
        super();
        //#region  Widgets used in this view */
        this.img = new FSImageView({ name: 'img', src: "/img/demo-img.png" });
        this.hello = new FSHead({ name: 'helloH1', headType: 'h1', text: 'Hello World!' });
        this.btnModal = new FSButton({ name: 'btnModal', btnClass: 'btn-success', text: 'Click to see it' });
        HelloWorldFS.$ = this;
        // Widget's events must be implemented in the derived FSView constructor
        this.btnModal.onClick = this.modalShow;
    }
    /**
     * After calling the constructor, the FSView (super) class takes
     * control of this class, and upon loading it (super) will call
     * some methods in the inherited class
     */
    /**
     * It is the first function invoked by FSView (super).
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
                    new Column('colHello', { colClass: 'col-5' })
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
     * It is the second function invoked by FSView (super) in the inherited class.
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
     * It is the third and last function invoked by FSView (super)
     *
     * At this point, the rendering of the view is complete and is
     * already visible on the page. You can change the widgets state here:
     * change text, apply styles, etc.
     */
    onViewDidLoad() {
        this.img.applyCSS('width', '370px');
        this.img.applyCSS('height', '250px');
        this.hello.setText('Hello World! Its working :)');
        this.hello.applyCSS('color', 'darkorange');
        this.hello.applyCSS('width', '100%');
        this.hello.applyCSS('text-align', 'center');
        // or...
        // this.hello.cssFromString('color:darkorange');
    }
    //#region others general or specific functions pertinent to this class (inherited)
    modalShow(ev) {
        const template = HelloWorldFS.$.inflateTemplateView('<label id="lbHello"> Hello World! by FrontStoreUI </label>');
        const lbHello = template.elementById('lbHello');
        var modal = new FSModalView({
            title: 'Its works!',
            shell: HelloWorldFS.$.shellPage,
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
