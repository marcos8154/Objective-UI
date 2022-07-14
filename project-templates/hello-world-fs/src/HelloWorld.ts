/**
 * These imports mostly come from the "Objective-UI.ts" library, 
 * which contains all the default widgets and mechanism for 
 * basic screen controls.
 */

import { Col, UIButton, UIHead, UIImage, UIDialog, ModalAction, Row, ViewLayout, UIView, UIPage, UITemplateView } from "./Objective-UI";

/**
 * An inheritance UIView class is able to represent a view and its controls. 
 * Controls are represented in derived UIWidgets, 
 * which are managed by the derived UIView
 */
export class HelloWorld extends UIView
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
    private hello = new UIHead({ name: 'helloH1', headType: 'h1', text: 'Hello World! Its working' })
    private sub = new UIHead({ name: 'subTt', headType: 'h5', text: `Objective-UI ${UIPage.PRODUCT_VERSION}` })
    private btnModal = new UIButton({ name: 'btnModal', btnClass: 'btn-success', text: 'Click to see it' })
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
        const defClass = 'row d-flex flex-row justify-content-center';
        // You can build the layout with representative objects (Row and Column)
        return new ViewLayout('app', [
            new Row('rowImg', {
                rowClass: defClass
            }),
            new Row('rowHello', {
                rowClass: defClass,
            }),
            new Row('rowSub', {
                rowClass: defClass,
                columns: [
                    new Col('colSub', { colClass: 'col-3' })
                ]
            })
        ])
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
        this.addWidgets('rowImg', this.img,);
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
    onViewDidLoad(): void
    {
        //feel free to try out the other functions/ways to modify Widgets CSS
        //such as .applyCSS() or .applyAllCSS()
        this.hello.cssFromString('width:100%; text-align:center');
        this.sub.cssFromString('width:100; text-align:center');
        this.img.cssFromString('width:200px; height:200px; margin-top:100px');
        this.btnModal.addCSSClass('align-self-center');
        this.renderDynamicContent();
    }

    //#region others general or specific functions pertinent to this class (inherited)
    private renderDynamicContent()
    {
        const template: UITemplateView = this.inflateTemplateView(`
            <p id="essential-libs">
                Thanks for: <br/>
            </p>
        `);

        const pElement: HTMLParagraphElement = template.elementById('essential-libs');
        for (var i = 0; i < this.shellPage.importedLibs.length; i++)
        {
            const lib = this.shellPage.importedLibs[i];
            pElement.append(`- ${lib.libName}`);
            pElement.appendChild(this.shellPage.createElement('br'));;
        }

        const divToAppend = this.shellPage.elementById('colSub');
        this.shellPage.appendChildToElement(divToAppend, pElement);
    }
    
    modalShow(ev: Event): void
    {
        const $ = HelloWorld.$;//self-instance shortcut
        const template = $.inflateTemplateView('<label id="lbHello"> Hello World! by Objective-UI </label>');
        const lbHello = template.elementById('lbHello') as HTMLLabelElement;

        var modal = new UIDialog({
            title: 'Its works!',
            shell: $.shellPage,
            name: 'hello-world-modal',
            contentTemplate: template,
            actions: [
                new ModalAction('Click to more surprise...', false, function (m: UIDialog)
                {
                    lbHello.textContent = 'Changed!';
                }, 'btn', 'btn-primary'),
                new ModalAction('Close', true, null, 'btn', 'btn-dark')
            ]
        });

        modal.show();
    }
    //#endregion
}