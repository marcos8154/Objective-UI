"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.YordManagedView = void 0;
class YordManagedView extends UIView {
    constructor(view, context) {
        super();
        view.managedView = this;
        this.yordView = view;
        this.yordCtx = context;
    }
    buildLayout() {
        return this.yordView.viewLayout.getLayout();
    }
    composeView() {
        for (var c = 0; c < this.yordView.viewComposing.length; c++) {
            var composingInfo = this.yordView.viewComposing[c];
            var widgets = composingInfo.w;
            this.addWidgets(composingInfo.id, ...widgets);
        }
    }
    onViewDidLoad() {
        this.yordView.onLoad(this.viewContext(), this.yordCtx);
    }
}
//exports.YordManagedView = YordManagedView;
