import { ChartContext, ChartContextEntry } from "../ChartContext";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";
import { VirtualFunction } from "../VirtualFunction";
import { Widget } from "../Widget";

export class PieChart extends Widget
{

    private entryId: string;
    private title: string;
    private canvasGl: HTMLCanvasElement;

    private entry: ChartContextEntry;

    constructor(name: string, title: string, entry: ChartContextEntry)
    {
        super(name)

        this.title = title;
        this.entry = entry
    }

    protected htmlTemplate(): string
    {
        return ` 
<div id="div-container" class="card shadow" style="max-height: 400px; width:100%; padding:15px" >
    <h4> ${this.title} </h4>
    <canvas id="grafico-pizza"  style="width:100%; max-height: 330px;"></canvas>
</div>
        `
    }

    protected onWidgetDidLoad(): void
    {
        let dvContainer = this.elementById('div-container') as HTMLDivElement
        let canvasGl = this.elementById('grafico-pizza') as HTMLCanvasElement
        this.canvasGl = canvasGl;
        if (!Misc.isNull(this.entry))
            this.refreshData(this.entry);
    }

    public refreshData(entry: ChartContextEntry)
    {
        this.entryId = entry.id;
        ChartContext.add(entry);
        let fn = new VirtualFunction({
            fnName: `exibeGfPizza_${this.entryId}`,
            keepAfterCalled: false,
            fnContent: `
                let chartStatus = Chart.getChart("${this.canvasGl.id}"); // <canvas> id
                if (chartStatus != undefined) {
                     chartStatus.destroy();
                }

                const canvas = document.getElementById('${this.canvasGl.id}');
                const ctx = ChartContext.get('${this.entryId}');
                new Chart(canvas, 
                {
                    type: 'pie',
                    data: 
                    {
                        labels: ctx.labels,
                        datasets: ctx.data
                    },
                    options: {
                        showAllTooltips: true,
                        maintainAspectRatio: false,
                        plugins: 
                        {
                            legend: 
                            {
                                display: true,
                                position: 'left',
                                align: 'end',
                                labels: 
                                {
                                    color: 'black',
                                    font: 
                                    {
                                        weight: 'bold'
                                    },
                                }
                            },

                            tooltip: {
                                enabled: true
                            },

                            datalabels: {
                                formatter: function(value, context) 
                                {
                                    var label = context.chart.data.labels[context.dataIndex];
                                    if(label.length > 8)
                                    {
                                        var parts = label.split(' ');
                                        var newLabel = (parts[0] + " ");
                                        for(var i = 1; i < parts.length; i++)
                                        {
                                            newLabel += parts[i][0] + ". ";
                                        }

                                        label = newLabel;
                                    }
                                
                                    return  label + ": " + context.dataset.data[context.dataIndex];
                                }
                            }
                       }
                    }
                });
            `}).call()
    }

    public setCustomPresenter(presenter: ICustomWidgetPresenter<Widget>): void {
        throw new Error("Method not implemented.");
    }
    public value(): string {
        throw new Error("Method not implemented.");
    }
    public setEnabled(enabled: boolean): void {
        throw new Error("Method not implemented.");
    }
    public addCSSClass(className: string): void {
        throw new Error("Method not implemented.");
    }
    public removeCSSClass(className: string): void {
        throw new Error("Method not implemented.");
    }
    public applyCSS(propertyName: string, propertyValue: string): void {
        throw new Error("Method not implemented.");
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void {
        throw new Error("Method not implemented.");
    }
    public setVisible(visible: boolean): void {
        throw new Error("Method not implemented.");
    }
}