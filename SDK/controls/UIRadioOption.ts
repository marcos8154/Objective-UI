import { Widget as Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { PageShell } from "../PageShell";
import { WidgetBinder } from "../WidgetBinder";
import { UITemplateView } from "./UITemplateView";
import { Misc } from "../Misc";
import { UIRadioGroup } from "./UIRadioGroup";

export class RadioOption
{
    public optionContainer: HTMLDivElement;
    public radioInput: HTMLInputElement;
    public radioLabel: HTMLLabelElement;
    private ownerGroup: UIRadioGroup;

    constructor(text: string,
        value: string,
        fieldSetId: string,
        shell: PageShell,
        ownerGroup: UIRadioGroup,
        customTemplate?: string)
    {

        if(!Misc.isNullOrEmpty(customTemplate))
        {
            if (customTemplate.indexOf('radioOptionContainer') == -1)
                throw new Error(`RadioOption '${text} / ${value}' failed to load: custom base-template does not contains an <div/> with Id="radioOptionContainer".`)
            if (customTemplate.indexOf('radioInput') == -1)
                throw new Error(`RadioOption '${text} / ${value}' failed to load: custom base-template does not contains an <input/> with Id="radioInput".`)
            if (customTemplate.indexOf('radioLabel') == -1)
                throw new Error(`RadioOption '${text} / ${value}' failed to load: custom base-template does not contains an <label/> with Id="radioLabel".`)
        }

        var template: UITemplateView = new UITemplateView(
            Misc.isNullOrEmpty(customTemplate)
                ? `
                <div id="radioOptionContainer" style="margin-right: 10px" class="custom-control custom-radio">
                    <input id="radioInput" type="radio" name="fieldset" class="custom-control-input">
                    <label id="radioLabel" class="custom-control-label font-weight-normal" for=""> Radio Option </label>
                </div>`
                : customTemplate,
            shell);

        this.ownerGroup = ownerGroup;
        this.optionContainer = template.elementById('radioOptionContainer');
        this.radioInput = template.elementById('radioInput');
        this.radioLabel = template.elementById('radioLabel');

        this.radioLabel.textContent = text;
        this.radioInput.value = value;
        this.radioInput.name = fieldSetId;
        this.radioLabel.htmlFor = this.radioInput.id;

        var self = this;
        this.radioInput.onclick = function (ev: Event)
        {
            ownerGroup.optionChanged(self);
        }
    }
    isChecked(): boolean
    {
        return this.radioInput.checked;
    }

    value(): string
    {
        return this.radioInput.value;
    }

    setChecked(isChecked: boolean): void
    {
        if (isChecked)
            this.ownerGroup.optionChanged(this);
        this.radioInput.checked = isChecked;
    }

    setEnabled(isEnabled: boolean): void
    {
        this.radioInput.disabled = (isEnabled == false);
    }
}

