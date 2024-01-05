import { INotifiable } from "../INotifiable";
import { Misc } from "../Misc";
import { Widget, WidgetContext } from "../Widget";
import { UIButton } from "./UIButton";


export class ToolbarState
{
    public readonly name: string;
    public readonly buttons: UIButton[];
    public readonly stateCallback: Function;

    public constructor(name: string, callback: Function, ...buttons: UIButton[])
    {
        this.name = name;
        this.buttons = buttons;
        this.stateCallback = callback;
    }

}

export class UIToolBar extends Widget
{
    public static $: UIToolBar;

    icon: string;
    tittle: string;

    public states: ToolbarState[];

    optionsContext: WidgetContext;

    constructor({ name, iconPath, barTittle }: {
        name: string;
        iconPath: string;
        barTittle: string;
    })
    {
        super(name);
        this.icon = iconPath;
        this.tittle = barTittle;
        this.states = [];
        UIToolBar.$ = this;
    }

    public defineState(name: string, callback: Function, ...buttons: UIButton[]): UIToolBar
    {
        this.states.push(new ToolbarState(name, callback, ...buttons));
        return this;
    }


    currentState: ToolbarState;

    public activateState(stateName: string)
    {
        this.currentState = null;
        for (var e = 0; e < this.states.length; e++)
            if (this.states[e].name == stateName)
            {
                this.currentState = this.states[e];
                break;
            }
        if (Misc.isNull(this.currentState))
            throw new Error(`The stete '${stateName}' does not registered in toolBar ${this.widgetName}`);

        this.optionsContext.clear();
        var stateButtons = this.currentState.buttons;
        for (var b = 0; b < stateButtons.length; b++)
            this.optionsContext.addWidget(this.containerId, stateButtons[b]);

        const $ = this;
        this.optionsContext.build(new class Noty implements INotifiable
        {
            onNotified(sender: any, args: any[]): void
            {
                var botoes = $.currentState.buttons;
                for (var w = 0; w < botoes.length; w++)
                {
                    const btn = botoes[w];
                    btn.setOnClickFn(() => UIToolBar.$.currentState.stateCallback(btn.widgetName));
                }
            }
        }, false);
    }

    protected htmlTemplate(): string
    {
        return `
<div class="d-flex flex-row card shadow-sm mx-2 p-0 mt-2" style="height:52px; background:whitesmoke">

    <div style="width:55px; height:48px; padding: 3px">
        <img style="width:45px; height:43px; padding:5px" class="card shadow-sm" id="ic_rotina" />
    </div>

    <label id="lb_titulo" class="h5 col-md-5 col-xs-2 mt-2 ps-0"> Nome Rotina </label>

    <div id="dv_opcoes" class="col d-flex justify-content-end mt-2 mb-2 me-2" style="overflow-x:auto">
      
    </div>

</div>
       
       `;
    }

    containerId: string;
    protected onWidgetDidLoad(): void
    {
        const iconeEl = this.elementById<HTMLImageElement>('ic_rotina');
        const tituloEl = this.elementById<HTMLLabelElement>('lb_titulo');
        const dvOpcoes = this.elementById<HTMLDivElement>('dv_opcoes');

        this.containerId = dvOpcoes.id;
        iconeEl.src = this.icon;
        tituloEl.textContent = this.tittle;
        this.optionsContext = new WidgetContext(this.getPageShell(), [this.containerId])
    }

    public getOption(buttonName: string): UIButton
    {
        return this.optionsContext.get<UIButton>(`${this.containerId}/${buttonName}`)
    }
}