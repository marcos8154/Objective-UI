"use strict";
class Tour extends UIView {
    constructor() {
        super();
        Tour.$ = this;
        this.options = new UIList({ name: 'lstOptions', itemClicked: this.listOptionClick });
    }
    listOptionClick(item, ev) {
        var $ = Tour.$;
        var item = $.options.selectedItem();
        if (item.value == 'Standard Widgets')
            $.shellPage.navigateToView(new DemoWidgets());
        if (item.value == 'Form example')
            $.shellPage.navigateToView(new SimpleFormWithAPI());
    }
    buildLayout() {
        return new ViewLayout('app')
            .fromHTML(`
            <div class="row" style="padding-top: 20px">
                <div id="sideList" class="col-2"> </div>
                <div id="content" class="col"> </div>
            </div>
            `);
    }
    composeView() {
        this.addWidgets('sideList', this.options);
    }
    onViewDidLoad() {
        this.options.fromList(['Standard Widgets', 'Form example']);
        this.options.setSelectedValue('Standard Widgets');
        this.shellPage.navigateToView(new DemoWidgets());
    }
}
