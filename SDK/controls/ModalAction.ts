import { Misc } from "../Misc";
import { UIDialog } from "./UIDialog";

export class ModalAction
{
    public text: string;
    public classes: string[] = [];
    public onClick?: Function;
    public dismis: boolean;

    constructor({ buttonText, dataDismiss = false, buttonClasses = 'btn btn-light', buttonClick = null }:
        {
            buttonText: string;
            dataDismiss?: boolean;
            buttonClick?: Function;
            buttonClasses?: string;
        })
    {
        this.text = buttonText;

        this.onClick = buttonClick;
        this.dismis = dataDismiss;

        const classesStr = buttonClasses.split(' ');
        for (var c = 0; c < classesStr.length; c++)
            this.classes.push(classesStr[c]);

        if (this.text == null)
            this.text = 'Modal action';
        if (this.classes == null || this.classes.length == 0)
            this.classes = ['btn', 'btn-primary'];
    }

    public setButton(button: HTMLButtonElement, modal: UIDialog)
    {
        var self = this;
        if (Misc.isNull(this.onClick) == false)
            button.onclick = function ()
            {
                self.onClick(modal);
            };
    }
}