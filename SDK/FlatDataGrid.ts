import { Misc } from "./Misc";
import { PageShell } from "./PageShell";
import { IDataGridItemTemplate } from "./controls/IDataGridItemTemplate";
import { IDataGridItemTemplateProvider } from "./controls/IDataGridItemTemplateProvider";
import { UIDataGrid } from "./controls/UIDataGrid";
import { UITemplateView } from "./controls/UITemplateView";


export class FlatDataGrid implements IDataGridItemTemplateProvider
{
    private callFn: Function;
    constructor(fn: Function)
    {
        this.callFn = fn
    }
    getDataGridItemTemplate(sender: UIDataGrid, viewModel: any): IDataGridItemTemplate
    {
        if (Misc.isNull(viewModel)) return
        var item = new FlatDataGridItem(viewModel)
        this.callFn(item)
        return item
    }
}


export class FlatDataGridItem implements IDataGridItemTemplate
{
    public value: any;
    itemName: string;
    sh: PageShell;

    constructor(vm: any)
    {
        this.value = vm;
    }


    setOwnerDataGrid(dataGrid: UIDataGrid): void
    {
        this.sh = dataGrid.getPageShell();
    }

    public tableRow: HTMLTableRowElement;
    /**  define o callback para isSelected()  */
    public onCheckSelected(fn: Function): FlatDataGridItem
    {
        this.fn_isSelected = fn;
        return this;
    }
    private fn_isSelected: Function;

    /**  define o callback para select()*/
    public onSelect(fn: Function): FlatDataGridItem
    {
        this.fn_select = fn;
        return this;
    }
    private fn_select: Function;
    /**  define o callback para unSelect()*/
    public onUnSelect(fn: Function): FlatDataGridItem
    {
        this.fn_unSelect = fn;
        return this;
    }
    private fn_unSelect: Function;
    /**  define o callback para itemTemplate()*/
    public onItemTemplate(fn: Function): FlatDataGridItem
    {
        this.fn_itemTemplate = fn;
        return this;
    }
    private fn_itemTemplate: Function;
    /**  define o um trecho html para ser usado pela funcão itemTemplate()*/
    public withHTML(htmlString: string): FlatDataGridItem
    {
        this.fn_itemTemplateString = htmlString;
        return this;
    }

    public containsCssClass(className: string): boolean
    {
        return this.tableRow.classList.contains(className)
    }

    public addCssClass(className: string)
    {
        this.tableRow.classList.add(className)
    }

    public removeCssClass(className: string)
    {
        this.tableRow.classList.remove(className)
    }

    private fn_itemTemplateString: string;


    setOwnerList(dataGrid: UIDataGrid): void
    {
        this.sh = dataGrid.getPageShell();
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


    itemTemplate(): HTMLTableRowElement
    {
        if (!Misc.isNull(this.fn_itemTemplate))
            return this.fn_itemTemplate(this);

        if (!Misc.isNull(this.fn_itemTemplateString))
        {
            const templ = new UITemplateView(this.fn_itemTemplateString, this.sh, this.value);
            var anchor = templ.elementById('table-row') as HTMLTableRowElement;
            this.tableRow = anchor;
            return anchor;

        }
    }


}