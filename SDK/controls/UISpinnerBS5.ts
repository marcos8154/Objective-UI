import { DefaultExceptionPage } from "../DefaultExceptionPage"
import { PageShell } from "../PageShell"
import { UISpinner } from "./UISpinner"


/**
 * UISpinner portado para Bootstrao 5
 */
export class UISpinnerBS5 extends UISpinner
{
    constructor({ name, colorClass = 'text-primary', visible = true }:
        {
            name: string,
            colorClass?: string,
            visible?: boolean
        })
    {

        super({ name, colorClass, visible })

        this.defineTemplate(`
<div id="container" class="spinner-border ${colorClass}" role="status">
    <span id="spnSpinner" class="visually-hidden">Loading...</span>
</div>
        `)
    }

    protected override onWidgetDidLoad(): void
    {
        if (PageShell.BOOTSTRAP_VERSION_NUMBER < 5)
            console.error(new Error(`UISpinnerBS5: this widget does not supports Bootstrap v${PageShell.BOOTSTRAP_VERSION}. Use 'UISpinner' class instead it.`))

        super.onWidgetDidLoad()
    }
}