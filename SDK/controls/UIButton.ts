import { Widget } from "../Widget";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";

export class UIButton extends Widget
{
    public buttonElement: HTMLButtonElement;
    public imageElement: HTMLImageElement;

    public text: string;
    public onClick: Function;
    public btnClass: string;
    public imageSrc: string;
    public imageWidth: string;

    constructor({ name, text, imageSrc, imageWidth = '20px', btnClass = 'btn' }:
        {
            name: string;
            text: string;
            imageSrc?: string;
            imageWidth?: string,
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
<button id="fsButton" type="button" class="btn">
     <img alt="img" id="fsButtonImage" src="${this.imageSrc}" style="width: ${this.imageWidth}"></img> 
</button>`
        }
        else
            return `<button id="fsButton" type="button" class="btn"> Button </button>`
    }
    protected onWidgetDidLoad(): void
    {
        var self = this;
        this.buttonElement = this.elementById('fsButton');
        this.imageElement = this.elementById('fsButtonImage');
        this.setText(this.text);

        if (Misc.isNullOrEmpty(this.btnClass) == false)
        {
            var btnClasses: Array<string> = this.btnClass.split(' ');

            for (var i = 0; i < btnClasses.length; i++)
            {
                var className = btnClasses[i].trim();
                if (!this.buttonElement.classList.contains(className))
                    this.buttonElement.classList.add(className);
            }
        }

        if (self.onClick != null)
        {
            this.buttonElement.onclick = function (ev)
            {
                self.onClick(ev);
            };
        }
    }

    public setOnClickFn(clickFn: Function)
    {
        const self = this;
        this.onClick = clickFn;
        if (!Misc.isNull(this.buttonElement))
            this.buttonElement.onclick = function ()
            {
                self.onClick()
            };
    }

    public setText(text: string)
    {
        this.buttonElement.innerText = text;

        if (this.imageSrc != '' && this.imageSrc != null && this.imageSrc != undefined)
        {
            this.imageElement.src = this.imageSrc;
            this.imageElement.style.width = this.imageWidth;
            this.buttonElement.appendChild(this.imageElement);
        }
    }

    public value(): string
    {
        throw new Error("Button does not support value");
    }

    public setVisible(visible: boolean): void
    {
        this.buttonElement.style.visibility = (visible ? 'visible' : 'hidden')
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

    public setCustomPresenter(renderer: ICustomWidgetPresenter<UIButton>): void
    {
        renderer.render(this);
    }
}