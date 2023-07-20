"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIButton = void 0;
class UIButton extends Widget {
    constructor({ name, text, imageSrc, imageWidth, btnClass = 'btn-light' }) {
        super(name);
        this.imageSrc = imageSrc;
        this.imageWidth = imageWidth;
        this.text = text;
        this.btnClass = btnClass;
    }
    htmlTemplate() {
        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined) {
            return `
<button id="fsButton" type="button" style="height: 35px" class="btn btn-block"> 
     <img alt="img" id="fsButtonImage" src="/icons/sb_menu.png" width="20" ></img> 
</button>`;
        }
        else
            return `<button id="fsButton" type="button" style="height: 35px" class="btn btn-block">Button</button>`;
    }
    onWidgetDidLoad() {
        var self = this;
        this.buttonElement = this.elementById('fsButton');
        this.imageElement = this.elementById('fsButtonImage');
        this.setText(this.text);
        if (Misc.isNullOrEmpty(this.btnClass) == false) {
            var btnClasses = this.btnClass.split(' ');
            for (var i = 0; i < btnClasses.length; i++)
                this.buttonElement.classList.add(btnClasses[i].trim());
        }
        if (self.onClick != null) {
            this.buttonElement.onclick = function (ev) {
                self.onClick(ev);
            };
        }
    }
    setText(text) {
        this.buttonElement.innerText = text;
        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined) {
            this.imageElement.src = this.imageSrc;
            this.imageElement.width = this.imageWidth;
            this.buttonElement.appendChild(this.imageElement);
        }
    }
    value() {
        throw new Error("Button does not support value");
    }
    setVisible(visible) {
        this.buttonElement.hidden = (visible == false);
    }
    setEnabled(enabled) {
        this.buttonElement.disabled = (enabled == false);
    }
    addCSSClass(className) {
        this.buttonElement.classList.add(className);
    }
    removeCSSClass(className) {
        this.buttonElement.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.buttonElement.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.buttonElement.style.position = position;
        this.buttonElement.style.left = marginLeft;
        this.buttonElement.style.top = marginTop;
        this.buttonElement.style.right = `${marginRight}`;
        this.buttonElement.style.bottom = `${marginBottom}`;
        this.buttonElement.style.transform = `${transform}`;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
}
//exports.UIButton = UIButton;
