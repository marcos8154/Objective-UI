"use strict";
/**
 * These imports mostly come from the "Objective-UI.ts" library,
 * which contains all the default widgets and mechanism for
 * basic screen controls.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorld = void 0;
const Objective_UI_1 = require("./Objective-UI");
/**
 * An inheritance UIView class is able to represent a view and its controls.
 * Controls are represented in derived UIWidgets,
 * which are managed by the derived UIView
 */
class HelloWorld extends Objective_UI_1.UIView {
    //#endregion
    constructor() {
        super();
        //#region  Widgets used in this view */
        this.img = new Objective_UI_1.UIImage({ name: 'img', src: "/img/demo-img.png" });
        this.hello = new Objective_UI_1.UIHead({ name: 'helloH1', headType: 'h1', text: 'Hello World! Its working' });
        this.sub = new Objective_UI_1.UIHead({ name: 'subTt', headType: 'h5', text: `Objective-UI ${Objective_UI_1.UIPage.PRODUCT_VERSION}` });
        this.btnModal = new Objective_UI_1.UIButton({ name: 'btnModal', btnClass: 'btn-success', text: 'Click to see it' });
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
        const defClass = 'row d-flex flex-row justify-content-center';
        // You can build the layout with representative objects (Row and Column)
        return new Objective_UI_1.ViewLayout('app', [
            new Objective_UI_1.Row('rowImg', {
                rowClass: defClass
            }),
            new Objective_UI_1.Row('rowHello', {
                rowClass: defClass,
            }),
            new Objective_UI_1.Row('rowSub', {
                rowClass: defClass,
                columns: [
                    new Objective_UI_1.Col('colSub', { colClass: 'col-3' })
                ]
            })
        ]);
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
        this.addWidgets('rowHello', this.hello);
        this.addWidgets('colSub', this.sub, this.btnModal);
    }
    /**
     * It is the third and last function invoked by UIView (super)
     *
     * At this point, the rendering of the view is complete and is
     * already visible on the page. You can change the widgets state here:
     * change text, apply styles, etc.
     */
    onViewDidLoad() {
        //feel free to try out the other functions/ways to modify Widgets CSS
        //such as .applyCSS() or .applyAllCSS()
        this.hello.cssFromString('width:100%; text-align:center');
        this.sub.cssFromString('width:100; text-align:center');
        this.img.cssFromString('width:200px; height:200px; margin-top:100px');
        this.btnModal.addCSSClass('align-self-center');
        this.renderDynamicContent();
    }
    //#region others general or specific functions pertinent to this class (inherited)
    renderDynamicContent() {
        const template = this.inflateTemplateView(`
            <p id="essential-libs">
                Thanks for: <br/>
            </p>
        `);
        const pElement = template.elementById('essential-libs');
        for (var i = 0; i < this.shellPage.importedLibs.length; i++) {
            const lib = this.shellPage.importedLibs[i];
            pElement.append(`- ${lib.libName}`);
            pElement.appendChild(this.shellPage.createElement('br'));
            ;
        }
        const divToAppend = this.shellPage.elementById('colSub');
        this.shellPage.appendChildToElement(divToAppend, pElement);
    }
    modalShow(ev) {
        const $ = HelloWorld.$; //self-instance shortcut
        const template = $.inflateTemplateView('<label id="lbHello"> Hello World! by FrontStoreUI </label>');
        const lbHello = template.elementById('lbHello');
        var modal = new Objective_UI_1.UIDialog({
            title: 'Its works!',
            shell: $.shellPage,
            name: 'hello-world-modal',
            contentTemplate: template,
            actions: [
                new Objective_UI_1.ModalAction('Click to more surprise...', false, function (m) {
                    lbHello.textContent = 'Changed!';
                }, 'btn', 'btn-primary'),
                new Objective_UI_1.ModalAction('Close', true, null, 'btn', 'btn-dark')
            ]
        });
        modal.show();
    }
}
exports.HelloWorld = HelloWorld;
