import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";

export class UILabelBinder extends WidgetBinder
{
    private label: UILabel;
    constructor(label: UILabel)
    {
        super(label);
        this.label = label;
    }

    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.label.setText(`${value}`);
    }
    fillPropertyModel(): void
    {
        var text: string = this.label.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue()
    {
        var text: string = this.label.getText();
        return text;
    }
}

export class UILabel extends Widget implements IBindable
{
    private lblText: string;

    constructor({ name, text }: { name: string, text: string })
    {
        super(name);
        this.lblText = text;
    }

    public label: HTMLLabelElement;
    protected htmlTemplate(): string
    {
        return `<label id="uiLabel" class="label"> Default label </label>`;
    }

    protected onWidgetDidLoad(): void
    {
        this.label = this.elementById('uiLabel');
        this.label.textContent = this.lblText;
    }
    public setText(text: string): void
    {
        this.label.textContent = text;
    }

    public getText(): string
    {
        return this.value();
    }



    getBinder(): WidgetBinder
    {
        return new UILabelBinder(this);
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return `${this.label.textContent}`;
    }

    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.label.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.label.classList.add(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.label.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.label.style.position = position;
        this.label.style.left = marginLeft;
        this.label.style.top = marginTop;
        this.label.style.right = marginRight;
        this.label.style.bottom = marginBottom;
        this.label.style.transform = `${transform}`;
    }
    public setVisible(visible: boolean): void
    {
        this.label.style.visibility = (visible ? 'visible' : 'hidden')
    }
}