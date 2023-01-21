import { Widget, WidgetContext } from "../Widget";
import { DivContent } from "./DivContent";
import { IYordLayout } from "./IYordLayout";
import { YordManagedView } from "./YordManagedView";
import { YordViewContext } from "./YordViewContext";

export abstract class YordView
{
    public readonly viewName: string;
    public viewLayout: IYordLayout;
    public viewWidgets: Widget[];
    public viewComposing: DivContent[];
    public managedView: YordManagedView;

    constructor(viewName: string)
    {
        this.viewName = viewName;
    }
    
    public useLayout(layout: IYordLayout): YordView
    {
        this.viewLayout = layout;
        return this;
    }

    public declareAndCompose(...composing: DivContent[]): YordView
    {
        this.viewComposing = composing;
        return this;
    }

    public abstract onInit(): void;
    public abstract onLoad(wc: WidgetContext, mvc: YordViewContext): void;

}