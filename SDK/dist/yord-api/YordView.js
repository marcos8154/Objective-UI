"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.YordView = void 0;
class YordView {
    constructor(viewName) {
        this.viewName = viewName;
    }
    useLayout(layout) {
        this.viewLayout = layout;
        return this;
    }
    declareAndCompose(...composing) {
        this.viewComposing = composing;
        return this;
    }
    createBinding(model) {
        return new BindingContext(model, this.managedView);
    }
}
//exports.YordView = YordView;
