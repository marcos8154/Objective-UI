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

    private fn_handlers: Function[] = [];


    /**
     * 
     * @param fn_handler Provide an callback function to handling UITemplateView after loads. Ex.:
     * ```
     * handle((template: UITemplateView) => {
     *   //     const btnExample: HTMLButtonElement = template.elementById('btnExample');
     *   //     btnExample.click(() => {   } );
     * })
     * ```
     * @returns 
     */
    public handle(fn_handler: Function): FlatDataGridItem
    {
        this.fn_handlers.push(fn_handler);
        return this;
    }

    public onItemTemplate(fn_handler: Function): FlatDataGridItem
    {
        this.fn_handlers.push(fn_handler);
        return this;
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

    /**  define o um trecho html para ser usado pela funcão itemTemplate()*/
    public withHTML(htmlString: string): FlatDataGridItem
    {
        this.html_template = htmlString;
        return this;
    }

    public template(htmlString: string): FlatDataGridItem
    {
        this.html_template = htmlString;
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

    private html_template: string;


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
        if (!Misc.isNull(this.html_template))
        {
            const templ = new UITemplateView(this.html_template, this.sh, this.value);
            var tableRow = templ.templateDOM.getElementsByTagName('tr')[0] as HTMLTableRowElement; //.elementById('table-row') as HTMLTableRowElement;
            if (Misc.isNull(tableRow)) throw new Error('Invalid FlatDataGridItem template. Anchor element not found in HTML snippet! Ensure that the template contains an <tr> tag.');
            this.tableRow = tableRow;

            for (var i = 0; i < this.fn_handlers.length; i++)
                this.fn_handlers[i](templ);

            return tableRow;

        }
        else
            throw new Error('Invalid FlatDataGridItem template. Template not defined! Ensure that functions `withHTML()` and `template()` was be called.');

    }


}