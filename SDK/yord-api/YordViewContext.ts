import { PageShell } from "../PageShell";
import { YordManagedView } from "./YordManagedView";
import { YordView } from "./YordView";

export class YordViewContext
{
    private managedViews: YordView[] = [];
    private pageShell: PageShell;

    constructor(shell: PageShell)
    {
        this.pageShell = shell;
    }

    public addView(view: YordView): YordViewContext
    {
        this.managedViews.push(view);
        return this;
    }

    public goTo(viewName: string): void
    {
        for (var v = 0; v < this.managedViews.length; v++)
        {
            var view: YordView = this.managedViews[v];
            if (view.viewName == viewName)
            {
                view.onInit();

                var managedView: YordManagedView = new YordManagedView(view, this);
                this.pageShell.navigateToView(managedView);
                break;
            }
        }
    }
}