"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIImage = //exports.UIImageBinder = void 0;
class UIImageBinder extends WidgetBinder {
    constructor(image) {
        super(image);
        this.img = image;
    }
    getWidgetValue() {
        return this.img.value();
    }
    refreshUI() {
        var valueModel = this.getModelPropertyValue();
        this.img.setSource(valueModel);
    }
    fillPropertyModel() { }
}
//exports.UIImageBinder = UIImageBinder;
class UIImage extends Widget {
    constructor({ name, src, cssClass, alt }) {
        super(name);
        if (cssClass == null)
            cssClass = 'img-fluid';
        this.imgCssClass = cssClass;
        this.imgSrc = src;
        this.imgAlt = `${alt}`;
    }
    getBinder() {
        return new UIImageBinder(this);
    }
    htmlTemplate() {
        return `<img id="fsImageView" src="" class="img-fluid" alt="">`;
    }
    onWidgetDidLoad() {
        this.image = this.elementById('fsImageView');
        this.image.alt = this.imgAlt;
        this.setSource(this.imgSrc);
        this.addCSSClass(this.imgCssClass);
    }
    setSource(imgSource) {
        this.imgSrc = imgSource;
        this.image.src = this.imgSrc;
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        return this.imgSrc;
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        this.image.classList.add(className);
    }
    removeCSSClass(className) {
        this.image.classList.remove(className);
    }
    applyCSS(propertyName, propertyValue) {
        this.image.style.setProperty(propertyName, propertyValue);
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        this.image.style.position = position;
        this.image.style.left = marginLeft;
        this.image.style.top = marginTop;
        this.image.style.right = marginRight;
        this.image.style.bottom = marginBottom;
        this.image.style.transform = `${transform}`;
    }
    setVisible(visible) {
        this.image.hidden = (visible == false);
    }
}
//exports.UIImage = UIImage;
