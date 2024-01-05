import { BindingContext } from "./BindingContext";
import { Misc } from "./Misc";
import { UIView } from "./UIView";
import { Widget, WidgetContext } from "./Widget";
import { DivContent } from "./yord-api/DivContent";

export class UIFlatViewBuilder
{

    public targetId: string;
    public layoutPath: string = '';
    public viewContent: DivContent[] = []
    public layoutHtml: string = null;
    private onLoadFn: Function;


    private constructor(layoutPath: string)
    {
        if (Misc.isNullOrEmpty(layoutPath))
            throw new Error('UIFlatView build failed: layoutPath is required.');
        this.layoutPath = layoutPath;
    }

    public static from(layoutPath: string): UIFlatViewBuilder
    {
        return new UIFlatViewBuilder(layoutPath);
    }

    public to(targetDivID: string): UIFlatViewBuilder
    {
        this.targetId = targetDivID;
        return this;
    }

    public with(...content: DivContent[]): UIFlatViewBuilder
    {
        if (!Misc.isNull(content))
            this.viewContent = content;
        return this;
    }


    private viewModelBind: any | object = null;

    public bindWith<TViewModel>(instance: TViewModel): UIFlatViewBuilder
    {
        this.viewModelBind = instance;
        return this;
    }

    public hasBinding()
    {
        return Misc.isNull(this.viewModelBind) == false;
    }

    public getBinding(view: UIView): BindingContext<any | object>
    {
        return new BindingContext(this.viewModelBind, view);
    }

    public put(divId: string, ...w: Widget[]): UIFlatViewBuilder
    {
        this.viewContent.push(
            new DivContent(divId, ...w)
        ); 
        return this;
    }

    public onLoad(fn: Function): UIFlatViewBuilder
    {
        this.onLoadFn = fn;
        return this;
    }

    callLoadFn(ctx: WidgetContext)
    {
        if (!Misc.isNull(this.onLoadFn))
            this.onLoadFn(ctx);
    }
}