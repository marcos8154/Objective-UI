import { DemoWidgets } from "./DemoWidgets";
import { IListItemTemplate, UIList, UIView, ViewLayout } from "./Objective-UI";
import { SimpleFormWithAPI } from "./SimpleFormWithAPI";

export class Tour extends UIView
{
    private static $: Tour;
    options: UIList;

    constructor()
    {
        super();

        Tour.$ = this;
        this.options = new UIList({ name: 'lstOptions', itemClicked: this.listOptionClick })
    }

    listOptionClick(item: IListItemTemplate, ev: Event): void
    {
        var $ = Tour.$;
        var item = $.options.selectedItem();
        if (item.value == 'Standard Widgets')
            $.shellPage.navigateToView(new DemoWidgets());
        if (item.value == 'Form example')
            $.shellPage.navigateToView(new SimpleFormWithAPI());
    }


    buildLayout(): ViewLayout
    {
        return new ViewLayout('app')
            .fromHTML(`
            <div class="row" style="padding-top: 20px">
                <div id="sideList" class="col-2"> </div>
                <div id="content" class="col"> </div>
            </div>
            `);
    }
    composeView(): void
    {
        this.addWidgets('sideList', this.options);
    }
    onViewDidLoad(): void
    {
        this.options.fromList(['Standard Widgets', 'Form example']);
        this.options.setSelectedValue('Standard Widgets');
        this.shellPage.navigateToView(new DemoWidgets());
    }

}