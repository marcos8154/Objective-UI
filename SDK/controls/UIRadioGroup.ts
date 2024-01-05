import { Widget as Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { PageShell } from "../PageShell";
import { WidgetBinder } from "../WidgetBinder";
import { UITemplateView } from "./UITemplateView";
import { Misc } from "../Misc";
import { RadioOption } from "./UIRadioOption";

export class UIRadioGroupBinder extends WidgetBinder
{
    private radioGp: UIRadioGroup;
    constructor(radioGroup: UIRadioGroup)
    {
        super(radioGroup);
        this.radioGp = radioGroup;
    }

    getWidgetValue()
    {
        return this.radioGp.value();
    }
    refreshUI(): void
    {
        var value = this.getModelPropertyValue();
        this.radioGp.setValue(value);
    }
    fillPropertyModel(): void
    {
        var value = this.getWidgetValue();
        this.setModelPropertyValue(value);
    }

}

export class UIRadioGroup extends Widget implements IBindable
{
    public groupContainer: HTMLDivElement;
    public groupTitle: HTMLLabelElement;
    public fieldSet: HTMLFieldSetElement;


    private options: Array<RadioOption> = [];
    private title: string;
    private orientation: string;

    private initialOptions: Array<any> = [];
    private onChangeFn: Function;

    /**
    * 
    * @param direction Flex direction: 'column' / 'row'
    * @param options array { t:'Option Text', v: 'option_value' }
    */
    constructor({ name, title = '', orientation = 'vertical', options = [], onChange = null }:
        {
            name: string,
            title?: string,
            orientation?: string,
            options?: Array<any>,
            onChange?: Function
        })
    {
        super(name);

        this.title = title;
        this.orientation = orientation;
        this.initialOptions = options;
        this.onChangeFn = onChange;
    }
    getBinder(): WidgetBinder
    {
        return new UIRadioGroupBinder(this);
    }

    public optionChanged(currentOp: RadioOption)
    {
        if (Misc.isNull(this.onChangeFn) == false)
            this.onChangeFn(currentOp, this);
    }

    public setOnChangedEvent(fn: Function)
    {
        this.onChangeFn = fn;
    }

    protected onWidgetDidLoad(): void
    {
        this.groupContainer = this.elementById('fsRadioGroup');
        this.groupTitle = this.elementById('groupTitle');
        this.fieldSet = this.elementById('fieldSet');

        this.groupTitle.textContent = this.title;

        if (this.orientation != 'horizontal' && this.orientation != 'vertical')
            throw new Error(`Invalid value '${orientation}' for 'orientation' parmeter. Accepted values are 'vertical' or 'horizontal'`);

        if (this.orientation == 'vertical')
            this.fieldSet.classList.add(`flex-column`);
        if (this.orientation == 'horizontal')
            this.fieldSet.classList.add(`flex-row`);

        this.addOptions(this.initialOptions);
    }

    protected htmlTemplate(): string
    {
        return `
<div id="fsRadioGroup">
  <label id="groupTitle" class="font-weight-normal" style="margin-left: 3px"> </label>
  <fieldset class="d-flex" id="fieldSet">

  </fieldset>
</div>`;
    }

    /**
     * 
     * @param options  array { t:'Option Text', v: 'option_value' }
     */
    addOptions(options: Array<any>)
    {
        for (var i = 0; i < options.length; i++)
        {
            var op = options[i];
            this.addOption(op.t, op.v);
        }
    }

    addOption(text: string, value: string)
    {
        var newOpt: RadioOption = new RadioOption(
            text,
            value,
            this.fieldSet.id,
            this.getPageShell(),
            this
        );
        this.options.push(newOpt);
        this.fieldSet.appendChild(newOpt.optionContainer);
    }

    addOptionR(newOpt: RadioOption)
    {
        this.options.push(newOpt);
        this.fieldSet.appendChild(newOpt.optionContainer);
    }

    fromList(models: Array<any>, textKey: string, valueKey: string)
    {
        for (var i = 0; i < models.length; i++)
        {
            var model = models[i];
            var text = model[textKey];
            var value = model[valueKey];
            this.addOption(text, value);
        }
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
    }

    public selectedOption(): RadioOption
    {
        for (var i = 0; i < this.options.length; i++)
            if (this.options[i].isChecked())
                return this.options[i];
    }

    public setValue(value: string): void
    {
        for (var i = 0; i < this.options.length; i++)
        {
            if (this.options[i].value() == value)
                this.options[i].setChecked(true);
            else
                this.options[i].setChecked(false);
        }
    }

    public value(): string
    {
        for (var i = 0; i < this.options.length; i++)
        {
            var op = this.options[i];
            if (op.isChecked())
                return op.value();
        }
        return '';
    }
    public setEnabled(enabled: boolean): void
    {
        for (var i = 0; i < this.options.length; i++)
        {
            var op = this.options[i];
            op.setEnabled(enabled);
        }
    }

    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.groupContainer.style.position = position;
        this.groupContainer.style.left = marginLeft;
        this.groupContainer.style.top = marginTop;
        this.groupContainer.style.right = marginRight;
        this.groupContainer.style.bottom = marginBottom;
        this.groupContainer.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.groupContainer.style.visibility = (visible ? 'visible' : 'hidden')
    }

}