"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.ModalAction = void 0;
class ModalAction {
    constructor({ buttonText, dataDismiss = false, buttonClasses = 'btn btn-light', buttonClick = null }) {
        this.classes = [];
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
    setButton(button, modal) {
        var self = this;
        if (Misc.isNull(this.onClick) == false)
            button.onclick = function () {
                self.onClick(modal);
            };
    }
}
//exports.ModalAction = ModalAction;
