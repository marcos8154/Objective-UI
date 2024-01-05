import { Misc } from "./Misc";
import { PageShell } from "./PageShell";
import { IListItemTemplate } from "./controls/IListItemTemplate";
import { IListItemTemplateProvider } from "./controls/IListItemTemplateProvider";
import { UIList } from "./controls/UIList";
import { UITemplateView } from "./controls/UITemplateView";

export class FlatList implements IListItemTemplateProvider
{
    private callFn: Function;
    constructor(fn: Function)
    {
        this.callFn = fn
    }
    getListItemTemplate(sender: UIList, viewModel: any): IListItemTemplate
    {
        if (Misc.isNull(viewModel)) return
        var item = new FlatListItem(viewModel)
        this.callFn(item)
        return item
    }

}

export class FlatListItem implements IListItemTemplate
{
    public value: any;
    itemName: string;
    sh: PageShell;

    constructor(vm: any)
    {
        this.value = vm;
    }

    public anchorElement: HTMLAnchorElement;

    /**  define o callback para isSelected()  */
    public onCheckSelected(fn: Function): FlatListItem
    {
        this.fn_isSelected = fn;
        return this;
    }
    private fn_isSelected: Function;

    /**  define o callback para select()*/
    public onSelect(fn: Function): FlatListItem
    {
        this.fn_select = fn;
        return this;
    }
    private fn_select: Function;
    /**  define o callback para unSelect()*/
    public onUnSelect(fn: Function): FlatListItem
    {
        this.fn_unSelect = fn;
        return this;
    }
    private fn_unSelect: Function;
    /**  define o callback para itemTemplate()*/
    public onItemTemplate(fn: Function): FlatListItem
    {
        this.fn_itemTemplate = fn;
        return this;
    }
    private fn_itemTemplate: Function;
    /**  define o um trecho html para ser usado pela funcão itemTemplate()*/
    public withHTML(htmlString: string): FlatListItem
    {
        this.fn_itemTemplateString = htmlString;
        return this;
    }

    public containsCssClass(className: string): boolean
    {
        return this.anchorElement.classList.contains(className)
    }

    public addCssClass(className: string)
    {
        this.anchorElement.classList.add(className)
    }

    public removeCssClass(className: string)
    {
        this.anchorElement.classList.remove(className)
    }

    private fn_itemTemplateString: string;


    setOwnerList(listView: UIList): void
    {
        this.sh = listView.getPageShell();
    }
    isSelected(): boolean
    {
        if (Misc.isNull(this.fn_isSelected)) return false;
        return this.fn_isSelected(this);
    }
    select(): void
    {
        if (Misc.isNull(this.fn_isSelected)) return;
        this.fn_select(this);
    }
    unSelect(): void
    {
        if (Misc.isNull(this.fn_isSelected)) return;
        this.fn_unSelect(this);
    }
    itemTemplate(): HTMLAnchorElement
    {
        if (!Misc.isNull(this.fn_itemTemplate))
            return this.fn_itemTemplate(this);

        if (!Misc.isNull(this.fn_itemTemplateString))
        {
            const templ = new UITemplateView(this.fn_itemTemplateString, this.sh, this.value);
            var anchor = templ.elementById('anchor') as HTMLAnchorElement;
            this.anchorElement = anchor;
            return anchor;

        }
    }
}