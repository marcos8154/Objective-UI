/**
 * These imports mostly come from the "FrontStoreUI.ts" library, 
 * which contains all the default widgets and mechanism for 
 * basic screen controls.
 */

import { Col, UIButton, UIHead, UIImage, UIDialog, View, ModalAction, Row, ViewLayout } from "./Objective-UI";

/**
 * An inheritance UIView class is able to represent a view and its controls. 
 * Controls are represented in derived UIWidgets, 
 * which are managed by the derived UIView
 */
export class HelloWorld extends View
{
    /**It is necessary to have a static instance to access this object 
     * inside function events 
     * ("this" CANNOT work inside a function event! )
     * 
     * The '$' is NOT about jQuery. 
     * It's just a short way to access this variable 
     * (call it whatever you want in your file, but that's better :) )
     *  */
    private static $: HelloWorld;


    //#region  Widgets used in this view */
    private img = new UIImage({ name: 'img', src: "/img/demo-img.png" })
    private hello = new UIHead({ name: 'helloH1', headType: 'h1', text: 'Hello World!' })
    private btnModal = new UIButton({ name: 'btnModal', btnClass: 'btn-success', text: 'Click to see it' });
    //#endregion

    constructor()
    {
        super();
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
    buildLayout(): ViewLayout
    {
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
        ])

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
    composeView(): void
    {
        this.addWidgets('rowImg',
            this.img,
        );
        this.addWidgets('colHello',
            this.hello,
            this.btnModal
        );
    }

    /**
     * It is the third and last function invoked by UIView (super)
     * 
     * At this point, the rendering of the view is complete and is 
     * already visible on the page. You can change the widgets state here: 
     * change text, apply styles, etc.
     */
    onViewDidLoad(): void
    {
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
    modalShow(ev: Event): void
    {
        const template = HelloWorld.$.inflateTemplateView('<label id="lbHello"> Hello World! by FrontStoreUI </label>');
        const lbHello = template.elementById('lbHello') as HTMLLabelElement;

        var modal = new UIDialog({
            title: 'Its works!',
            shell: HelloWorld.$.shellPage,
            name: 'hello-world-modal',
            contentTemplate: template,
            actions: [
                new ModalAction('Click to more surprise...', false, function (m: UIDialog)
                {
                    lbHello.textContent = 'Changed!';
                }, 'btn', 'btn-success'),
                new ModalAction('Close', true)
            ]
        });

        modal.show();
    }
    //#endregion
}