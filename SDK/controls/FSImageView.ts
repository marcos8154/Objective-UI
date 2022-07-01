import { FSWidget } from "../FSWidget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";

export class FSImageViewBinder extends WidgetBinder
{
    private img: FSImageView;
    constructor(image: FSImageView)
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

export class FSImageView extends FSWidget implements IBindable
{
    public image: HTMLImageElement;
    
    private imgSrc:string;
    private imgAlt:string;
    private imgCssClass: string;

    constructor({name, src, cssClass, alt}: 
        {
          name: string, 
          src?: string, 
          cssClass?:string, 
          alt?: string
        })
    {
        super(name);

        if(cssClass == null)
           cssClass = 'img-fluid'
        
        this.imgCssClass = cssClass;
        this.imgSrc = src;
        this.imgAlt = `${alt}`;
    }
    getBinder(): WidgetBinder
    {
        return new FSImageViewBinder(this);
    }

    protected htmlTemplate(): string
    {
        return `<img id="fsImageView" src="" class="img-fluid" alt="">`;
    }

    protected onWidgetDidLoad(): void
    {
        this.image = this.elementById('fsImageView');
        this.image.alt = this.imgAlt;
        this.setSource(this.imgSrc);
        this.addCSSClass(this.imgCssClass);
    }

    public setSource(imgSource: string)
    {
        this.imgSrc = imgSource;
        this.image.src = this.imgSrc;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
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
        this.image.hidden = (visible == false);
    }
}