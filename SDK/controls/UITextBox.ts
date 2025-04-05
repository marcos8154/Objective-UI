import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";
import { VirtualFunction } from "../VirtualFunction";
import { WidgetBinder } from "../WidgetBinder";
import { UIButton } from "./UIButton";
import { UIPage } from "../UIPage";

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

    public static toUpperCaseDefault: boolean = false;

    toUpperCase: boolean;
    floatPlaces: number;
    symbolRight: boolean;
    protected htmlTemplate(): string
    {
        var contentGroup = `
        <span id="entrySymbol" style="height: 31px" class="input-group-text" > </span>
        <input id="entryInput" ${this.toUpperCase ? 'oninput="this.value = this.value.toUpperCase();"' : ''} class="form-control form-control-sm"  placeholder="Entry placeholder">`

        if (this.symbolRight) contentGroup = `
        <input id="entryInput" ${this.toUpperCase ? 'oninput="this.value = this.value.toUpperCase();"' : ''} class="form-control form-control-sm"  placeholder="Entry placeholder">
        <span  style="height: 31px" class="input-group-text"> 
            <button id="entrySymbol" class="btn btn-sm" style="border:none;"> </button>
        </span>`

        return `
<div id="divContainer" class="${this.containerClass}">
    <label id="entryTitle" style="margin: 0px; padding: 0px; font-weight:normal !important;" for="inputEntry"> Entry Title </label>
    <div class="input-group"> 
${contentGroup}
    </div>
</div>`
    }

    onWidgetDidLoad(): void
    {
        this.lbTitle = this.elementById('entryTitle');
        this.txInput = this.elementById('entryInput');
        this.divContainer = this.elementById('divContainer');
        this.spanSymbol = this.elementById('entrySymbol');

        if (Misc.isNullOrEmpty(this.initialSymbol))
            this.spanSymbol.remove()
        else
        {
            if (this.initialSymbol.indexOf('.png') > -1)
            {
                const img = document.createElement('img');
                img.id = `${this.widgetName}_symbol`;
                img.src = this.initialSymbol;
                img.style.width = '20px';
                img.style.height = '20px';

                this.spanSymbol.appendChild(img);
            }
            else
                this.spanSymbol.textContent = this.initialSymbol
        }

        if (Misc.isNullOrEmpty(this.initialTitle))
            this.lbTitle.remove()
        else
            this.lbTitle.innerText = this.initialTitle;

        if (this.isFloat)
            this.txInput.inputMode = 'numeric';

        this.txInput.placeholder = this.initialPlaceHolder;

        this.setMaxLength(this.initialMaxlength);
        this.setInputType(this.initialType);
        this.applyMask(this.initialMask);

        if (this.required)
            this.txInput.setAttribute('required', 'required');

        this.setText(this.initialText)
    }


    public setEnabled(enabled: boolean): void
    {
        this.txInput.disabled = (enabled == false);
    }
    public setSymbol(symbol: string)
    {
        if (Misc.isNull(this.spanSymbol)) return;
        this.spanSymbol.textContent = symbol;
    }


    private initialTitle: string = null;
    private initialPlaceHolder: string = null;
    private initialText: string = null;
    private initialType: string = null;
    private initialMaxlength: number = null;
    private initialMask: string = null;
    private containerClass: string = null;
    private required: boolean = false;
    private initialSymbol: string = null

    public lbTitle: HTMLLabelElement = null;
    public txInput: HTMLInputElement = null;
    public divContainer: HTMLDivElement = null;
    public spanSymbol: HTMLSpanElement = null;

    constructor({
        name,
        type = 'text',
        title = '',
        maxlength = 100,
        placeHolder = '',
        text = '',
        mask = '',
        containerClass = 'form-group',
        isRequired = false,
        isFloat = false,
        floatPlaces = 2,
        symbol = '',
        symbolRight = false,
        toUpperCase = null
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
        isFloat?: boolean,
        floatPlaces?: number
        symbol?: string,
        symbolRight?: boolean,
        toUpperCase?: boolean
    })
    {
        super(name);

        this.isFloat = isFloat;
        this.required = isRequired;
        this.initialType = (Misc.isNullOrEmpty(type) ? 'text' : type);
        this.initialTitle = (Misc.isNullOrEmpty(title) ? '' : title);
        this.initialPlaceHolder = (Misc.isNullOrEmpty(placeHolder) ? '' : placeHolder);
        this.initialText = (Misc.isNullOrEmpty(text) ? '' : text);
        this.initialMaxlength = (Misc.isNullOrEmpty(maxlength) ? 100 : maxlength);
        this.initialMask = (Misc.isNull(mask) ? '' : mask);
        this.containerClass = (Misc.isNull(containerClass) ? 'form-group' : containerClass);
        this.initialSymbol = symbol
        this.symbolRight = symbolRight
        this.floatPlaces = (Misc.isNull(floatPlaces) ? 2 : floatPlaces)

        if (type == 'email') toUpperCase = false

        if (!Misc.isNull(toUpperCase))
            this.toUpperCase = toUpperCase
        else
            this.toUpperCase = UITextBox.toUpperCaseDefault
    }

    /**
     * 
     * @param fnOnEnter 
     * ```
     * setOnEnter((sender: UITextBox) => {
     *    //   user has pressed enter
     })
     * ```
     * @param useOnBlurIfAppleMobile iOS default NUMERIC keyboard does not have the 'Enter' properly key, so we use the blur event that responds on 'Ok' pressed
     * @returns 
     */
    public setOnEnter(fnOnEnter: Function, useOnBlurIfAppleMobile: boolean = false)
    {
        if (UIPage.isAppleMobileDevice() && useOnBlurIfAppleMobile)
        {
            this.txInput.enterKeyHint = 'done';
            this.txInput.onchange = (ev) => fnOnEnter(this);
            return
        }
        // not apple mobile
        this.txInput.onkeydown = (ev) => 
        {
            if (ev.key == 'Enter')
                fnOnEnter(this);
        }
    }

    /**
     * 
     * @param fnOnInput 
     * ````
     * setOnInput((sender: UITextBox) => {
     *    //   user has typed something
     * })
     * ```
     */
    public setOnInput(fnOnInput: Function)
    {
        this.txInput.oninput = (ev) => fnOnInput(this);
    }
    /**
     * 
     * @param keyHandlers {[key: string]: Function}
      ```
       // example
       myTextBox.setOnKeyDown({
            'Enter': () => { },
            'F': () => { },
            'ArrowUp': () => { }
        })
        ```
     */
    public setOnKeyDown(keyHandlers: { [key: string]: Function })
    {
        this.txInput.enterKeyHint = 'done';
        this.txInput.onkeydown = (ev) => 
        {
            const handlers = keyHandlers[ev.key]
            if (!Misc.isNull(handlers))
                keyHandlers[ev.key]()
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

    public focusAndSelect()
    {
        this.txInput.focus()
        this.txInput.select()
    }

    public focus()
    {
        this.txInput.focus();
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

        if (tp == 'color')
            this.txInput.value = newText
        if (tp == 'date')
            this.txInput.valueAsDate = (Misc.isNullOrEmpty(newText) ? new Date() : new Date(newText));
        if (tp == 'number' || this.isFloat)
        {
            if (newText.toString().indexOf('.') == -1 && newText.toString().indexOf(',') == -1)
            {
                const val = (Misc.isNullOrEmpty(newText) ? 0 : Number.parseInt(newText.toString()));
                if (this.txInput.type == 'number') this.txInput.valueAsNumber = val;
                else this.txInput.value = val.toString();
                return
            }
            else
            {
                const val = (Misc.isNullOrEmpty(newText) ? 0 : Number.parseFloat(newText.toString().replace(',', '.')))
                if (this.txInput.type == 'number') this.txInput.valueAsNumber = val;
                else this.txInput.value = `${val.toFixed(this.floatPlaces)}`
                this.isFloat = true;
                return
            }
        }
        if (tp == 'text')
            this.txInput.value = (Misc.isNullOrEmpty(newText) ? '' : newText);
    }

    public setTitle(newTitle: string): void
    {
        this.lbTitle.textContent = newTitle;
    }

    public value(): object | any | string | number
    {

        if (this.txInput.type == 'number' || this.isFloat)
        {
            var val = this.txInput.value
            if (val.indexOf('.') > -1 && val.indexOf(',') > -1)
            {
                val = val.replace('.', '')
                val = val.replace(',', '.')
            }
            else val = val.replace(',', '.')

            if (this.isFloat) return Number.parseFloat(val).toFixed(this.floatPlaces);
            else return Number.parseInt(this.txInput.value);
        }
        if (this.txInput.type == 'date')
            return this.txInput.value

        if (this.txInput.type == 'text') return this.txInput.value.toString();
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