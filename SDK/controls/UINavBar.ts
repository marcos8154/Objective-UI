import { View } from "../UIView";
import { ViewLayout } from "../ViewLayout";
import { Widget } from "../Widget";
import { WidgetMessage } from "../WidgetMessage";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";

export class UINavBar extends Widget
{

    public navBar: HTMLDivElement;
    public leftLinks: HTMLUListElement;
    public rightLinks: HTMLUListElement;
    public brandText: HTMLAnchorElement;
    public pushMenuButton: HTMLAnchorElement;

    constructor(name: string)
    {
        super(name);
    }

    protected htmlTemplate(): string
    {
        return `
<nav id="fsNavbar" class="navbar fixed-top">
  
    <!-- Left navbar links -->
    <ul id="navLeftLinks" class="navbar-nav">
        <li class="nav-item">
           <a id="btnPushMenu" class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
       
     
    </ul>

   <a id="brandText" class="navbar-brand">My First App</a>

    <!-- Right navbar links -->
    <ul id="navRightLinks" class="navbar-nav ml-auto">
    </ul>
</nav>`
    }

    onWidgetDidLoad(): void
    {
        this.navBar = this.elementById('fsNavbar');
        this.leftLinks = this.elementById('navLeftLinks')
        this.rightLinks = this.elementById('navRightLinks')
        this.brandText = this.elementById('brandText');
        this.pushMenuButton = this.elementById('btnPushMenu');

        this.pushMenuButton.style.marginLeft = '5px';
        this.brandText.style.marginLeft = '10px';
        this.navBar.style.boxShadow = '0 0 1em lightgray';
    }

    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.navBar.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.navBar.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.navBar.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.navBar.style.position = position;
        this.navBar.style.left = marginLeft;
        this.navBar.style.top = marginTop;
        this.navBar.style.right = marginRight;
        this.navBar.style.bottom = marginBottom;
        this.navBar.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.navBar.hidden = (visible == false);
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
    }


}