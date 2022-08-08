# Objective-UI

A TypeScript-based library for building fully object-oriented web interfaces

![](https://raw.githubusercontent.com/marcos8154/Objective-UI/main/standard_1.png)
![](https://raw.githubusercontent.com/marcos8154/Objective-UI/main/standard_2.png)

## How does this happen?

Through a single and exclusive interaction with objects and abstractions, we provide the library with control at the lowest level of the DOM, and in return we manipulate and build the interfaces at the high level through consistent objects that represent the state of one or more physical elements in DOM

```Typescript
    /**
     * Abstractions of elements (or sets of them) present in the DOM, 
     * represented in rich objects that encapsulate behavior, 
     * layout and styling
     * We'll call these things "Widget's"
     */

    private img = new UIImage({ name: 'img', src: "/img/source.png" })
    private hello = new UIHead({ name: 'helloH1', headType: 'h1', text: 'Hello World! Its working' })
    private sub = new UILabel({ name: 'lbAny', text: `Label Text` })
    private textBox = new UITextBox({ name: 'txName', title: 'Input title', placeHolder: 'Entry placeholder' })
    private listView = new UIList({ name: 'lstFriends' })
    private dataGrid = new UIDataGrid({ name: 'dgFriendsGrid' })
    private btnModal = new UIButton({ name: 'btnModal', btnClass: 'btn-success', text: 'Click to see it' })
    //and others...
```

## Widget-based framework

A Widget is a high-level abstraction of a set of DOM elements. It exposes standard functionality of a conventional UI control.

For a Widget to be created an inherited class will be indicated; it will provide your superclass with a raw-html template, which will be converted into DOM objects and these will be directly controlled by the inherited class

![](https://raw.githubusercontent.com/marcos8154/Objective-UI/main/widget_concept.png)

The above illustration translates to something like this:

```Typescript
export class UILabel extends Widget
{
    //the instance of the HTML5 element(s) objects that will be manipulated
    public label: HTMLLabelElement; 
    
    // superclass Widget requests the html snippet we want to "objectize"
    protected htmlTemplate(): string  
    {
        return `<label id="uiLabel" class="label"> Default label </label>`;
    }

    // after the conversion is done, we can access elements contained in the snippet through their declared Id's
    protected onWidgetDidLoad(): void 
    {
        this.label = this.elementById('uiLabel');
        
        //and then we manipulate the DOM object in its fullest and most flexible way possible!
        this.label.textContent = this.lblText;
    }
    //...
}
```

And then we consume like this:

```Typescript
  this.img.setVisible(true);
  this.img.setSource('/image/new_source.png');
  this.hello.setText('Changed text');
  this.contactsList.fromList(this.getContacts());
  this.sub.addCSSClass('any-css-class');
  this.hello.cssFromString('color:#885008;text-align:center');
  this.btnTour.onClick = this.startTour;
```
The library **has some conventional and basic widgets.** You can at any time transform any HTML snippet into a Widget, bringing the snippet to life in the form of rich objects

## Consuming and displaying Widgets

![](https://raw.githubusercontent.com/marcos8154/Objective-UI/main/uiview_1.png)

Creating a "screen" in our app just involves providing an inheritance for the UIView superclass.

UIView is the class that will abstract the presentation of the UI, which contains a set of Widgets arranged in a Layout dedicated to the View

```Typescript
export class ViewExample extends UIView
```

![](https://raw.githubusercontent.com/marcos8154/Objective-UI/main/UIView_2.png)

```Typescript
/**
 * An inheritance UIView class is able to represent a view and its controls. 
 * Controls are represented in derived UIWidgets, 
 * which are managed by the derived UIView
 */
export class ViewExample extends UIView
{
    private static $: ViewExample;

    //Declare required Widgets in View
    private label = new UILabel({ name: 'lbl1', text: 'My first UIView' })
    private textBox = new UITextBox({ name: 'txtInput', title: 'Input value here' })
    private btnShow = new UIButton({ name: 'btnShow', text: 'Show typed value!' })

    constructor()
    {
        super();
        HelloWorld.$ = this;

        this.btnShow.onClick = function ()
        {
            var view = HelloWorld.$;
            var text = view.textBox.getText();
            alert(`Typed: '${text}'`);
        }
    }

    //Provide a Layout for the View
    buildLayout(): ViewLayout
    {
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
    composeView(): void
    {
        this.addWidgets('layout-column', this.label, this.textBox, this.btnShow);
    }
    onViewDidLoad(): void
    {
        /**
         * All View and Widgets were properly 
         * initialized and presented on the page. 
         * Now we can change the state and go 
         * ahead with our View's logic.
         */
    }
}

```

The example above will result in this display:
![](https://raw.githubusercontent.com/marcos8154/Objective-UI/main/result.png)
