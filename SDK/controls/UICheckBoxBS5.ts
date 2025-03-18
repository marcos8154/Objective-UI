import { Widget } from "../Widget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";
import { UICheckBox } from "./UICheckBox";

/**
 * Exclusive Bootstrap v5.x CheckBox compat.
 */
export class UICheckBoxBS5 extends UICheckBox
{
    constructor({ name, text, checked = false}:
        {
            name: string;
            text: string;
            checked?: boolean;
        })
    {
        const customTemplate = `
        <div id="UICheckBox" class="">
            <input id="checkElement" class="form-check-input" type="checkbox" value="">
            <label id="checkLabel" class="form-check-label" for="checkLabel">
                Checked checkbox
            </label>
        </div> `;

        super({ name, text, checked, customTemplate });
    }
}