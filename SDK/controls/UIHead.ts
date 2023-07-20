import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";

export class UIHeadBinder extends WidgetBinder
{
    public head: UIHead;
    constructor(head: UIHead)
    {
        super(head);
        this.head = head;
    }

    getWidgetValue()
    {
        return this.head.value();
    }
    refreshUI(): void
    {
        var propValue = this.getModelPropertyValue();
        this.head.setText(`${propValue}`);
    }
    fillPropertyModel(): void { }
}

export class UIHead extends Widget implements IBindable
{
    private headType: string;
    private textContent: string;
    public headElement: HTMLHeadElement;
    constructor({ name, headType, text }:
        {
            name: string,
            headType: string,
            text: string
        })
    {
        super(name);

        if (headType == '' || headType == null || headType == undefined)
            headType = 'H1';

        this.textContent = text;
        this.headType = headType
            .replace('<', '')
            .replace('/', '')
            .replace('>', '');
    }
    getBinder(): WidgetBinder
    {
        return new UIHeadBinder(this);
    }
    protected htmlTemplate(): string
    {
        return `<${this.headType} id="fsHead"> </${this.headType}>`
    }
    protected onWidgetDidLoad(): void
    {
        this.headElement = this.elementById('fsHead');
        this.headElement.textContent = this.textContent;
    }

    public setCustomPresenter(presenter: ICustomWidgetPresenter<Widget>): void
    {
        presenter.render(this);
    }

    public setText(text: string): void
    {
        this.headElement.textContent = text;
    }

    public value(): string
    {
        return this.headElement.textContent;
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.headElement.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.headElement.classList.remove(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.headElement.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.headElement.style.position = position;
        this.headElement.style.left = marginLeft;
        this.headElement.style.top = marginTop;
        this.headElement.style.right = `${marginRight}`;
        this.headElement.style.bottom = `${marginBottom}`;
        this.headElement.style.transform = `${transform}`;
    }
    public setVisible(visible: boolean): void
    {
        this.headElement.hidden = (visible == false);
    }

}