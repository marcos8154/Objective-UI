"use strict";
/**
 * These imports mostly come from the "Objective-UI.ts" library,
 * which contains all the default widgets and mechanism for
 * basic screen controls.
 */
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.HelloWorld = void 0;
/**
 * An inheritance UIView class is able to represent a view and its controls.
 * Controls are represented in derived UIWidgets,
 * which are managed by the derived UIView
 */
class HelloWorld extends UIView {
    constructor() {
        super();
        //Declare required Widgets in View
        this.label = new UILabel({ name: 'lbl1', text: 'My first UIView' });
        this.textBox = new UITextBox({ name: 'txtInput', title: 'Input value here' });
        this.btnShow = new UIButton({ name: 'btnShow', text: 'Show typed value!' });
        HelloWorld.$ = this;
        this.btnShow.onClick = function () {
            var view = HelloWorld.$;
            var text = view.textBox.getText();
            alert(`Typed: '${text}'`);
        };
    }
    ///Provide a Layout for the View
    buildLayout() {
        return new ViewLayout('app', [
            new Row('layout-row', {
                columns: [
                    new Col('layout-column', {
                        colClass: 'col-xs-12 col-sm-12 col-md-8 col-lg-4',
                        colHeight: '100vh'
                    })
                ]
            })
        ]);
    }
    //Append the Widgets declared in some div that was produced by buildLayout()
    composeView() {
        this.addWidgets('layout-column', this.label, this.textBox, this.btnShow);
    }
    onViewDidLoad() {
        /**
         * All View and Widgets were properly
         * initialized and presented on the page.
         * Now we can change the state and go
         * ahead with our View's logic.
         */
    }
}
//exports.HelloWorld = HelloWorld;
