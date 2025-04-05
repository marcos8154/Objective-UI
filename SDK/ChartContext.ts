import { Misc } from "./Misc";
import { Widget } from "./Widget";


export class ChartDataset
{
    public pointRadius: number = 0
    public label: string = ''
    public data: number[] = []
    public borderWidth: number = 0
    public tension: number = 0.3;

    constructor({ label, data, pointRadius = 0, borderWidth = 0, tension = 0.03 }:{
        label: string,
        data: number[],
        pointRadius?: number,
        borderWidth?: number,
        tension?: number
    })
    {
        this.label = label;
        this.data = data;
        this.pointRadius = pointRadius
        this.borderWidth = borderWidth;
        this.tension = tension;
    }
}

export class ChartContextEntry
{
    public id: string = '';
    public textAny: string = '';
    public labels: string[] = [];
    public data: ChartDataset[] = [];

    constructor({ labels = null, data = null }:
        {
            labels?: string[],
            data?: ChartDataset[]
        })
    {
        this.id = Widget.generateUUID();

        if (!Misc.isNull(labels))
            this.labels = labels;
        if (!Misc.isNull(data))
            this.data = data;
    }

    public addLabel(label: string): ChartContextEntry
    {
        this.labels.push(label);
        return this;
    }

    public addDataSet(dataSet: ChartDataset): ChartContextEntry
    {
        this.data.push(dataSet);
        return this;
    }
}

export class ChartContext
{
    private static entries: ChartContextEntry[] = [];

    public static add(entry: ChartContextEntry)
    {
        ChartContext.entries.push(entry);
    }

    public static get(entryId: string): ChartContextEntry
    {
        for (var i = 0; i < ChartContext.entries.length; i++)
        {
            let e: ChartContextEntry = ChartContext.entries[i];
            if(e.id == entryId)
            {
                ChartContext.entries.slice(i, 1);
                return e;
            }
        }
    }
}