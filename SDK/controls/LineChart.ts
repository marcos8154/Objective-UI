import { ChartContext, ChartContextEntry } from "../ChartContext";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";
import { VirtualFunction } from "../VirtualFunction";
import { Widget } from "../Widget";

export class LineChart extends Widget
{
    private entryId: string;
    public canvas: HTMLCanvasElement;
    public divContainer: HTMLDivElement;
    private title: string;

    private entry: ChartContextEntry = null;
    constructor(name: string, title: string, entry?: ChartContextEntry)
    {
        super(name)

        this.title = title;
        this.entry = entry;
    }

    public resize(): void
    {
        this.canvas.style.width = '100%';
    }

    protected htmlTemplate(): string
    {
        return ` 
<div id="div-container" class="card shadow" style="max-height: 400px; width:100%;padding:15px" >
    <h4> ${this.title} </h4>
    <canvas id="grafico-linhas" style="width:100%; max-height: 300px;"></canvas>
</div>
        `
    }

    protected onWidgetDidLoad(): void
    {
        let dvContainer = this.elementById('div-container') as HTMLDivElement
        let canvasGl = this.elementById('grafico-linhas') as HTMLCanvasElement

        this.divContainer = dvContainer;
        this.canvas = canvasGl;

        if (!Misc.isNull(this.entry))
            this.refreshData(this.entry);
    }

    public refreshData(entry: ChartContextEntry)
    {
        this.entryId = entry.id;
        ChartContext.add(entry);
        return new VirtualFunction({
            fnName: `exibeGfLinhas_${this.entryId}`,
            keepAfterCalled: false,
            fnContent: `
                let chartStatus = Chart.getChart("${this.canvas.id}"); // <canvas> id
                if (chartStatus != undefined) {
                     chartStatus.destroy();
                }
                const canvas = document.getElementById('${this.canvas.id}');
                const ctx = ChartContext.get('${this.entryId}');
                new Chart(canvas, 
                {
                    type: 'line',
                    data: 
                    {
                        labels: ctx.labels,
                        datasets: ctx.data
                    },
                    options: {

                        maintainAspectRatio: false
                    }
                });
            `
        }).call();
    }

    public setCustomPresenter(presenter: ICustomWidgetPresenter<Widget>): void
    {
    }
    public value(): string
    {
        return this.entryId;
    }
    public setEnabled(enabled: boolean): void
    {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void
    {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void
    {
        throw new Error("Method not implemented.");
    }

}