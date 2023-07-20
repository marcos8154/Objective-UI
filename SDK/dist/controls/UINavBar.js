"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UINavBar = void 0;
class UINavBar extends Widget {
    constructor(name) {
        super(name);
    }
    htmlTemplate() {
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
</nav>`;
    }
    onWidgetDidLoad() {
        this.navBar = this.elementById('fsNavbar');
        this.leftLinks = this.elementById('navLeftLinks');
        this.rightLinks = this.elementById('navRightLinks');
        this.brandText = this.elementById('brandText');
        this.pushMenuButton = this.elementById('btnPushMenu');
        this.pushMenuButton.style.marginLeft = '5px';
        this.brandText.style.marginLeft = '10px';
        this.navBar.style.boxShadow = '0 0 1em lightgray';
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    value() {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.navBar.classList.add(className);
    }
    removeCSSClass(className) {
        this.navBar.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.navBar.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.navBar.style.position = position;
        this.navBar.style.left = marginLeft;
        this.navBar.style.top = marginTop;
        this.navBar.style.right = marginRight;
        this.navBar.style.bottom = marginBottom;
        this.navBar.style.transform = transform;
    }
    setVisible(visible) {
        this.navBar.hidden = (visible == false);
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
}
//exports.UINavBar = UINavBar;
