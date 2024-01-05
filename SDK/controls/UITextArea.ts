import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";
import { VirtualFunction } from "../VirtualFunction";
import { WidgetBinder } from "../WidgetBinder";
import { UIButton } from "./UIButton";

export class UITextAreaBinder extends WidgetBinder
{
    private textBox: UITextArea;
    constructor(textBox: UITextArea) 
    {
        super(textBox);
        this.textBox = this.widget as UITextArea;
    }
    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.textBox.setText(`${value}`);
    }
    fillPropertyModel(): void
    {
        var text: string = this.textBox.getText();
        this.setModelPropertyValue(text);
    }
    getWidgetValue()
    {
        var text: string = this.textBox.getText();
        return text;
    }
}

export class UITextArea extends Widget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="divContainer" class="form-group">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <textarea id="entryInput" class="form-control form-control-sm"> </textarea>
</div>`
    }
    public setEnabled(enabled: boolean): void
    {
        this.txInput.disabled = (enabled == false);
    }


    private initialTitle: string = null;
    private initialText: string = null;
    private initialMaxlength: number = null;
    private initialHeight: string = null;

    public lbTitle: HTMLLabelElement = null;
    public txInput: HTMLTextAreaElement = null;
    public divContainer: HTMLDivElement = null;

    constructor({ name, title = '', height = '100px', maxlength = 255, text = ''}:
        {
            name: string
            title?: string
            height?: string
            maxlength?: number
            text?: string
        })
    {
        super(name);

        this.initialHeight = (Misc.isNull(height) ? '100px' : height);
        this.initialTitle = (Misc.isNullOrEmpty(title) ? '' : title);
        this.initialText = (Misc.isNullOrEmpty(text) ? '' : text);
        this.initialMaxlength = (Misc.isNullOrEmpty(maxlength) ? 100 : maxlength);
    }
    getBinder(): WidgetBinder
    {
        return new UITextAreaBinder(this);
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<UITextArea>): void
    {
        renderer.render(this);
    }

    onWidgetDidLoad(): void
    {
        this.lbTitle = this.elementById<HTMLLabelElement>('entryTitle');
        this.txInput = this.elementById<HTMLTextAreaElement>('entryInput');
        this.divContainer = this.elementById<HTMLDivElement>('divContainer');

        this.lbTitle.innerText = this.initialTitle;
        this.txInput.value = this.initialText;
        this.txInput.style.height = this.initialHeight;

        this.setMaxLength(this.initialMaxlength);
    }

    public setMaxLength(maxlength: number): void
    {
        this.txInput.maxLength = maxlength;
    }

    public removeLabel()
    {
        this.lbTitle.remove();
    }
    public setPlaceholder(text: string): void
    {
        this.txInput.placeholder = text;
    }

    public getText(): string
    {
        return this.value();
    }

    public setText(newText: string): void
    {
        this.txInput.value = (Misc.isNullOrEmpty(newText) ? '' : newText);
    }

    public setTitle(newTitle: string): void
    {
        this.lbTitle.textContent = newTitle;
    }

    public value(): string
    {
        return this.txInput.value;
    }

    public addCSSClass(className: string): void 
    {
        this.txInput.classList.add(className);
    }

    public removeCSSClass(className: string): void
    {
        this.txInput.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void 
    {
        this.txInput.style.setProperty(propertyName, propertyValue);
    }

    public setPosition(position: string,
        marginLeft: string,
        marginTop: string,
        marginRight: string,
        marginBottom: string,
        transform?: string): void 
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }

    public setVisible(visible: boolean): void 
    {
        this.divContainer.style.visibility = (visible ? 'visible' : 'hidden')
    }

}