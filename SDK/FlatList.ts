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
    public value: any | object;
    public itemName: string;
    public sh: PageShell;
    public tag: any | object;

    constructor(vm: any)
    {
        this.value = vm;
    }

    public anchorElement: HTMLAnchorElement;
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
    public handle(fn_handler: Function): FlatListItem
    {
        this.fn_handlers.push(fn_handler);
        return this;
    }


    fn_getItemTemplate: Function = null;
    /**
     * 
     * @param fn_handler 
     * ```
     * (item: FlatListItem) => {
     *    const templ = new UITemplateView('', item.sh, item.value);
     *    // ..... 
     *    return templ
     * }
     * ```
     * @returns 
     */
    public onItemTemplate(fn_handler: Function): FlatListItem
    {

        this.fn_getItemTemplate = fn_handler;
        return this;
    }

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
    private html_template: string = '';
    /**  define o um trecho html para ser usado pela funcão itemTemplate()*/
    public withHTML(htmlString: string): FlatListItem
    {
        this.html_template = htmlString;
        return this;
    }

    /**  define o um trecho html para ser usado pela funcão itemTemplate()*/
    public template(htmlString: string): FlatListItem
    {
        this.html_template = htmlString;
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
    public templateView: UITemplateView

    itemTemplate(): HTMLAnchorElement
    {
        if (Misc.isNullOrEmpty(this.html_template))
        {
            var anchor: HTMLAnchorElement = null
            const templ = this.fn_getItemTemplate(this);

            if (templ instanceof UITemplateView)
            {
                this.templateView = templ
                anchor = templ.templateDOM.getElementsByTagName('a')[0] as HTMLAnchorElement;
                if (Misc.isNull(anchor)) throw new Error('Invalid FlatListItem template. Anchor element not found in HTML snippet! Ensure that the template contains an <a> tag.');
                this.anchorElement = anchor;

                for (var i = 0; i < this.fn_handlers.length; i++)
                    this.fn_handlers[i](templ);

            }
            if(templ instanceof HTMLAnchorElement)
            {
                this.anchorElement = templ;
                anchor = templ
            }
            return anchor;
        }
        else
        {
            const templ = new UITemplateView(this.html_template, this.sh, this.value);
            this.templateView = templ
            var anchor = templ.templateDOM.getElementsByTagName('a')[0] as HTMLAnchorElement;
            if (Misc.isNull(anchor)) throw new Error('Invalid FlatListItem template. Anchor element not found in HTML snippet! Ensure that the template contains an <a> tag.');
            this.anchorElement = anchor;

            for (var i = 0; i < this.fn_handlers.length; i++)
                this.fn_handlers[i](templ);

            return anchor;
        }
    }
}