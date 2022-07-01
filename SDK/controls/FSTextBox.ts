import { FSWidget } from "../FSWidget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { PageJsFunction } from "../PageJsFunction";
import { WidgetBinder } from "../WidgetBinder";
import { FSButton } from "./FSButton";

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

export class FSTextBoxBinder extends WidgetBinder
{
    private textBox: FSTextBox;
    constructor(textBox: FSTextBox) 
    {
        super(textBox);
        this.textBox = this.widget as FSTextBox;
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

export class FSTextBox extends FSWidget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="textEntry" class="form-group">
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

    private lbTitle: HTMLLabelElement = null;
    private txInput: HTMLInputElement = null;
    private divContainer: HTMLDivElement = null;

    constructor({ name, title, placeHolder, text }:
        {
            name: string;
            title?: string;
            placeHolder?: string;
            text?: string;
        })
    {
        super(name);

        this.initialTitle = title;
        this.initialPlaceHolder = placeHolder;
        this.initialText = text;
    }
    getBinder(): WidgetBinder
    {
        return new FSTextBoxBinder(this);
    }

    applyMask(maskPattern: string): void
    {
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

        var maskFunction = new PageJsFunction({
            fnName: 'enableMask',
            fnContent: jQueryCall
        });
        maskFunction.call();
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSTextBox>): void
    {
        renderer.render(this);
    }

    onWidgetDidLoad(): void
    {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('textEntry');

        this.lbTitle.innerText = this.initialTitle;
        this.txInput.placeholder = this.initialPlaceHolder;
        this.txInput.value = this.initialText;
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
        this.txInput.value = newText;
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
        this.divContainer.hidden = (visible == false);
    }

}