import { Widget as Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { PageShell } from "../PageShell";
import { WidgetBinder } from "../WidgetBinder";
import { UITemplateView } from "./UITemplateView";
import { Misc } from "../Misc";
import { UIRadioGroup } from "./UIRadioGroup";
import { UIRadioOption } from "./UIRadioOption";

/**
 * Exclusive Bootstrap 5.x UIRadioOption compat.
 */
export class UIRadioOptionBS5 extends UIRadioOption
{
    constructor(text: string,
        value: string,
        fieldSetId: string,
        shell: PageShell,
        ownerGroup: UIRadioGroup)
    {
        super(text, value, fieldSetId, shell, ownerGroup,
            `
<div id="radioOptionContainer" style="margin-right: 10px" class="form-check form-check-primary mt-3">
  <input id="radioInput" name="default-radio-1" class="form-check-input" type="radio" value="" id="defaultRadio2">
  <label id="radioLabel" class="form-check-label" for="defaultRadio2">
      Checked
  </label>
</div> `)
    }

}

