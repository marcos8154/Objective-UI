"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.YordViewContext = void 0;
class YordViewContext {
    constructor(shell) {
        this.managedViews = [];
        this.pageShell = shell;
    }
    addView(view) {
        this.managedViews.push(view);
        return this;
    }
    goTo(viewName) {
        for (var v = 0; v < this.managedViews.length; v++) {
            var view = this.managedViews[v];
            if (view.viewName == viewName) {
                view.onInit();
                var managedView = new YordManagedView(view, this);
                this.pageShell.navigateToView(managedView);
                break;
            }
        }
    }
}
//exports.YordViewContext = YordViewContext;
