import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";
import { Misc } from "../Misc";

export class UIImageBinder extends WidgetBinder
{
    private img: UIImage;
    constructor(image: UIImage)
    {
        super(image);
        this.img = image;
    }
    getWidgetValue()
    {
        return this.img.value();
    }
    refreshUI(): void
    {
        var valueModel = this.getModelPropertyValue();
        this.img.setSource(valueModel);
    }
    fillPropertyModel(): void { }
}

export class UIImage extends Widget implements IBindable
{
    public image: HTMLImageElement;

    private imgSrc: string;
    private imgAlt: string;
    private imgCssClass: string;
    width: string;
    height: string;

    constructor({ name, src, cssClass, alt, width, height }:
        {
            name: string,
            src?: string,
            cssClass?: string,
            alt?: string,
            width?: string,
            height?: string
        })
    {
        super(name);

        if (cssClass == null)
            cssClass = 'img-fluid'

        this.imgCssClass = cssClass;
        this.imgSrc = src;
        this.imgAlt = `${alt}`;
        this.width = width;
        this.height = height;
    }
    getBinder(): WidgetBinder
    {
        return new UIImageBinder(this);
    }

    protected htmlTemplate(): string
    {
        return `<img id="fsImageView" src="" class="img-fluid" alt="">`;
    }

    protected onWidgetDidLoad(): void
    {
        this.image = this.elementById('fsImageView');

        if (!Misc.isNullOrEmpty(this.width))
            this.image.style.width = this.width

        if (!Misc.isNullOrEmpty(this.height))
            this.image.style.height = this.height

        this.image.alt = this.imgAlt;
        this.setSource(this.imgSrc);

        if (!Misc.isNullOrEmpty(this.imgCssClass))
        {
            var classes = this.imgCssClass.split(' ');
            for (var c = 0; c < classes.length; c++)
                this.addCSSClass(classes[c])
        }
    }

    public setSource(imgSource: string)
    {
        this.imgSrc = imgSource;
        this.image.src = this.imgSrc;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return this.imgSrc;
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.image.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.image.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.image.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.image.style.position = position;
        this.image.style.left = marginLeft;
        this.image.style.top = marginTop;
        this.image.style.right = marginRight;
        this.image.style.bottom = marginBottom;
        this.image.style.transform = `${transform}`;
    }
    public setVisible(visible: boolean): void
    {
        this.image.style.visibility = (visible ? 'visible' : 'hidden')
    }
}