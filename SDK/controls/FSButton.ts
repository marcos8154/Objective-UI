import { FSWidget } from "../FSWidget";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";

export class FSButton extends FSWidget
{
    public buttonElement: HTMLButtonElement;
    public imageElement: HTMLImageElement;

    private text: string;
    public onClick: Function;
    private btnClass: string;
    private imageSrc: string;
    private imageWidth: number;

    constructor({ name, text, imageSrc, imageWidth, btnClass = 'btn-light' }:
        {
            name: string;
            text: string;
            imageSrc?: string;
            imageWidth?: number,
            btnClass?: string
        })
    {
        super(name);

        this.imageSrc = imageSrc;
        this.imageWidth = imageWidth;
        this.text = text;
        this.btnClass = btnClass;
    }

    protected htmlTemplate(): string
    {
        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined)
        {
            return `
<button id="fsButton" type="button" style="height: 35px" class="btn btn-block"> 
     <img alt="img" id="fsButtonImage" src="/icons/sb_menu.png" width="20" ></img> 
</button>`
        }
        else
            return `<button id="fsButton" type="button" style="height: 35px" class="btn btn-block">Button</button>`
    }
    protected onWidgetDidLoad(): void
    {
        var self = this;
        this.buttonElement = this.elementById('fsButton');
        this.buttonElement.classList.add(this.btnClass);
        this.imageElement = this.elementById('fsButtonImage');

        this.setText(this.text);
        
        if (self.onClick != null)
        {
            this.buttonElement.onclick = function (ev)
            {
                self.onClick(ev);
            };
        }
    }

    public setText(text: string)
    {
        this.buttonElement.innerText = text;

        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined)
        {
            this.imageElement.src = this.imageSrc;
            this.imageElement.width = this.imageWidth;
            this.buttonElement.appendChild(this.imageElement);
        }
    }

    public value(): string
    {
        throw new Error("Button does not support value");
    }

    public setVisible(visible: boolean): void
    {
        this.buttonElement.hidden = (visible == false);
    }

    public setEnabled(enabled: boolean): void
    {
        this.buttonElement.disabled = (enabled == false);
    }

    public addCSSClass(className: string): void
    {
        this.buttonElement.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.buttonElement.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.buttonElement.style.setProperty(propertyName, propertyValue);
    }

    public setPosition(position: string,
        marginLeft: string,
        marginTop: string,
        marginRight?: string,
        marginBottom?: string,
        transform?: string): void
    {
        this.buttonElement.style.position = position;
        this.buttonElement.style.left = marginLeft;
        this.buttonElement.style.top = marginTop;
        this.buttonElement.style.right = `${marginRight}`;
        this.buttonElement.style.bottom = `${marginBottom}`;
        this.buttonElement.style.transform = `${transform}`;
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSButton>): void
    {
        renderer.render(this);
    }
}