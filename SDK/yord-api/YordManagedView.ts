import { Misc } from "../Misc";
import { UIView } from "../UIView";
import { ViewLayout } from "../ViewLayout";
import { Widget } from "../Widget";
import { YordView } from "./YordView";
import { YordViewContext } from "./YordViewContext";

export class YordManagedView extends UIView
{
    private yordView: YordView;
    private yordCtx: YordViewContext;

    constructor(view: YordView, context: YordViewContext)
    {
        super();
        view.managedView = this;
        this.yordView = view;
        this.yordCtx = context;
    }

    buildLayout(): ViewLayout
    {
        return this.yordView.viewLayout.getLayout();
    }

    composeView(): void
    {
        if (Misc.isNull(this.yordView.viewComposing))
            return;

        for (var c = 0; c < this.yordView.viewComposing.length; c++)
        {
            var composingInfo = this.yordView.viewComposing[c];
            var widgets: Widget[] = composingInfo.w;
            this.addWidgets(composingInfo.id, ...widgets);
        }
    }

    onViewDidLoad(): void
    {
        this.yordView.onLoad(this.viewContext(), this.yordCtx);
    }
}