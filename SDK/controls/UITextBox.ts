import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";
import { VirtualFunction } from "../VirtualFunction";
import { WidgetBinder } from "../WidgetBinder";
import { UIButton } from "./UIButton";

export class Mask
{
    /** 00/00/0000 */
    public static DATE: string = '00/00/0000';

    /**00:00:00 */
    public static TIME: string = '00:00:00';

    /**00/00/0000 00:00:00 */
    public static DATE_TIME: string = '00/00/0000 00:00:00';

    /**00000-000 */
    public static CEP: string = '00000-000';

    /**0000-0000 */
    public static PHONE: string = '0000-0000';

    /** (00) 0000-0000*/
    public static PHONE_DDD: string = '(00) 0000-0000';

    /**(000) 000-0000 */
    public static PHONE_US: string = '(000) 000-0000';

    /**000.000.000-00 */
    public static CPF: string = '000.000.000-00';

    /**00.000.000/0000-00 */
    public static CNPJ: string = '00.000.000/0000-00';

    /**000.000.000.000.000,00 */
    public static MONEY: string = '000.000.000.000.000,00';

    /**#.##0,00 */
    public static MONEY2: string = '#.##0,00';

    /**099.099.099.099 */
    public static IP_ADDRESS: string = '099.099.099.099';

    /**##0,00% */
    public static PERCENT: string = '##0,00%';

    public static array(): Array<string>
    {
        return [
            this.DATE,
            this.TIME,
            this.DATE_TIME,
            this.CEP,
            this.PHONE,
            this.PHONE_DDD,
            this.PHONE_US,
            this.CPF,
            this.CNPJ,
            this.MONEY,
            this.MONEY2,
            this.IP_ADDRESS,
            this.PERCENT
        ];
    }
}

export class UITextBoxBinder extends WidgetBinder
{
    private textBox: UITextBox;
    constructor(textBox: UITextBox) 
    {
        super(textBox);
        this.textBox = this.widget as UITextBox;
    }
    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.textBox.setText(`${value}`);
    }
    fillPropertyModel(): void
    {
        this.setModelPropertyValue(this.textBox.value());
    }
    getWidgetValue()
    {
        return this.textBox.value();
    }
}

export class UITextBox extends Widget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="divContainer" class="${this.containerClass}">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <input id="entryInput" class="form-control form-control-sm"  placeholder="Entry placeholder">
</div>`
    }
    public setEnabled(enabled: boolean): void
    {
        this.txInput.disabled = (enabled == false);
    }


    private initialTitle: string = null;
    private initialPlaceHolder: string = null;
    private initialText: string = null;
    private initialType: string = null;
    private initialMaxlength: number = null;
    private initialMask: string = null;
    private containerClass: string = null;
    private required: boolean = false;


    public lbTitle: HTMLLabelElement = null;
    public txInput: HTMLInputElement = null;
    public divContainer: HTMLDivElement = null;

    constructor({
        name,
        type = 'text',
        title = '',
        maxlength = 100,
        placeHolder = '',
        text = '',
        mask = '',
        containerClass = 'form-group',
        isRequired = false
    }: {
        name: string;
        type?: string;
        mask?: string,
        maxlength?: number,
        title?: string;
        placeHolder?: string;
        text?: string;
        containerClass?: string
        isRequired?: boolean
    })
    {
        super(name);

        this.required = isRequired;
        this.initialType = (Misc.isNullOrEmpty(type) ? 'text' : type);
        this.initialTitle = (Misc.isNullOrEmpty(title) ? '' : title);
        this.initialPlaceHolder = (Misc.isNullOrEmpty(placeHolder) ? '' : placeHolder);
        this.initialText = (Misc.isNullOrEmpty(text) ? '' : text);
        this.initialMaxlength = (Misc.isNullOrEmpty(maxlength) ? 100 : maxlength);
        this.initialMask = (Misc.isNull(mask) ? '' : mask);
        this.containerClass = (Misc.isNull(containerClass) ? 'form-group' : containerClass);
    }
    public setOnEnter(fnOnEnter: Function)
    {
        this.txInput.onkeydown = (ev) => 
        {
            if (ev.key == 'Enter')
                fnOnEnter();
        }
    }

    getBinder(): WidgetBinder
    {
        return new UITextBoxBinder(this);
    }

    applyMask(maskPattern: string): void
    {
        if (Misc.isNullOrEmpty(maskPattern)) return;
        //making jQuery call
        var jQueryCall = `$('#${this.txInput.id}').mask('${maskPattern}'`;
        var a = Mask.array();
        var hasReverseFields = (
            (a.indexOf(Mask.CPF) +
                a.indexOf(Mask.CNPJ) +
                a.indexOf(Mask.MONEY) +
                a.indexOf(Mask.MONEY2)) >= 0)
        if (hasReverseFields)
            jQueryCall += ', {reverse: true});';
        else
            jQueryCall += ');';
        jQueryCall = `try { ${jQueryCall} } catch { }`;

        var maskFunction = new VirtualFunction({
            fnName: 'enableMask',
            fnContent: jQueryCall
        });
        maskFunction.call();
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<UITextBox>): void
    {
        renderer.render(this);
    }

    public setInputType(inputType: string): void
    {
        this.txInput.type = inputType;
    }

    onWidgetDidLoad(): void
    {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('divContainer');

        this.lbTitle.innerText = this.initialTitle;
        this.txInput.placeholder = this.initialPlaceHolder;
        this.txInput.value = this.initialText;

        this.setMaxLength(this.initialMaxlength);
        this.setInputType(this.initialType);
        this.applyMask(this.initialMask);

        if (this.required)
            this.txInput.setAttribute('required', 'required');
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
    private isFloat = false;
    public setText(newText: string): void
    {
        const tp = this.txInput.type;
        if (tp == 'text')
            this.txInput.value = (Misc.isNullOrEmpty(newText) ? '' : newText);
        if (tp == 'date')
            this.txInput.valueAsDate = (Misc.isNullOrEmpty(newText) ? new Date() : new Date(newText));
        if (tp == 'number')
        {
            if (newText.indexOf('.') == -1)
                this.txInput.valueAsNumber = (Misc.isNullOrEmpty(newText) ? 0 : Number.parseInt(newText));
            else
            {
                this.txInput.valueAsNumber = (Misc.isNullOrEmpty(newText) ? 0 : Number.parseFloat(newText));
                this.isFloat = true;
            }
        }
    }

    public setTitle(newTitle: string): void
    {
        this.lbTitle.textContent = newTitle;
    }

    public value(): object | any | string
    {
        if (this.txInput.type == 'text') return this.txInput.value.toString();
        if (this.txInput.type == 'number')
        {
            if (this.isFloat) return Number.parseFloat(this.txInput.value);
            else return Number.parseInt(this.txInput.value);
        }
        if (this.txInput.type == 'date')
            return new Date(this.txInput.value)
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