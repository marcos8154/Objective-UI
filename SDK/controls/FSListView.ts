import { FSWidget } from "../FSWidget";
import { IBindable } from "../IBindable";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { WidgetBinder } from "../WidgetBinder";
import { IListItemTemplate } from "./IListItemTemplate";
import { IListItemTemplateProvider } from "./IListItemTemplateProvider";
import { ListItem } from "./ListItem";

export class FSListViewBinder extends WidgetBinder
{
    private listView: FSListView;
    constructor(listView: FSListView)
    {
        super(listView);
        this.listView = listView;
    }
    refreshUI(): void
    {
        var viewModels: Array<any> = this.getModelPropertyValue();
        this.listView.fromList(viewModels, this.valueProperty, this.displayProperty);
    }
    getWidgetValue()
    {
        var item = this.listView.selectedItem();
        if (item == null) return null;
        return item.value;
    }
    fillPropertyModel(): void { }
}

export class FSListView extends FSWidget implements IBindable
{
    protected htmlTemplate(): string
    {
        return `
<div id="fsListView" class="list-group">
</div>`
    }
    public items: Array<IListItemTemplate> = [];
    public divContainer: HTMLDivElement;

    private itemClickedCallback: Function;

    private templateProvider: IListItemTemplateProvider;

    /**
     * 
     * @param itemClicked Function to handle onClick item event. 
     * 
     * Parameters: **(item: IListItemTemplate, ev: Event)**
     */
    constructor({ name, itemClicked = null, templateProvider = null }:
        {
            name: string;
            itemClicked?: Function,
            templateProvider?: IListItemTemplateProvider
        })
    {
        super(name);

        this.templateProvider = templateProvider;
        this.itemClickedCallback = itemClicked;
    }

    public itemTemplateProvider(): IListItemTemplateProvider
    {
        return this.templateProvider;
    }

    getBinder(): WidgetBinder
    {
        return new FSListViewBinder(this);
    }

    public fromList(viewModels: Array<any>, valueProperty?: string, displayProperty?: string): void
    {
        if (viewModels == null || viewModels == undefined) return;
        this.divContainer.innerHTML = '';
        for (var i = 0; i < viewModels.length; i++)
        {
            var viewModel: any | object = viewModels[i];
            var text = (displayProperty == null ? `${viewModel}` : viewModel[displayProperty]);
            var value = (valueProperty == null ? `${viewModel}` : viewModel[valueProperty]);

            if (this.itemTemplateProvider() == null)
            {
                var defaultItemTemplate = new ListItem(
                    `${i+1}`,
                    text,
                    value);

                this.addItem(defaultItemTemplate);
            }
            else
            {
                var templateProvider = this.itemTemplateProvider();
                var customItem = templateProvider.getListItemTemplate(this, viewModel);
                this.addItem(customItem);
            }
        }
    }

    protected onWidgetDidLoad(): void
    {
        this.divContainer = this.elementById('fsListView');
    }

    public onItemClicked(item: IListItemTemplate, ev: Event): void
    {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].unSelect();
        item.select();
        if (this.itemClickedCallback != null && this.itemClickedCallback != undefined)
            this.itemClickedCallback(item, ev);
    }

    public addItem(item: IListItemTemplate): FSListView
    {
        item.setOwnerList(this);
        this.items.push(item);
        var view: HTMLAnchorElement = item.itemTemplate();
        this.divContainer.append(view);
        return this;
    }

    public removeItem(item: IListItemTemplate): void
    {
        for (var i = 0; i < this.divContainer.children.length; i++)
        {
            var view: HTMLAnchorElement = this.divContainer.children[i] as HTMLAnchorElement;
            if (view.id == item.itemName)
            {
                var indx = this.items.indexOf(item);
                if (indx >= 0) this.items.splice(indx, 1);

                this.divContainer.removeChild(view);
                item = null;
                return;
            }
        }
    }

    public setSelectedValue(itemValue: any): void
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.value == itemValue)
                item.select();
            else
                item.unSelect();
        }
    }

    public setSelectedItem(selectedItem: IListItemTemplate): void
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            item.unSelect();
        }
        selectedItem.select();
    }

    public selectedItem(): IListItemTemplate
    {
        for (var i = 0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.isSelected())
                return item;
        }
        return null;
    }
    public selectedValue(): any | object
    {
        var sItem = this.selectedItem();
        if (sItem == null || sItem == undefined) return null;
        return sItem.value;
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return this.selectedValue();
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        this.divContainer.classList.add(className);
    }
    public removeCSSClass(className: string): void
    {
        this.divContainer.classList.remove(className);
    }

    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.divContainer.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        this.divContainer.style.position = position;
        this.divContainer.style.left = marginLeft;
        this.divContainer.style.top = marginTop;
        this.divContainer.style.right = marginRight;
        this.divContainer.style.bottom = marginBottom;
        this.divContainer.style.transform = transform;
    }
    public setVisible(visible: boolean): void
    {
        this.divContainer.hidden = (visible == false);
    }
}