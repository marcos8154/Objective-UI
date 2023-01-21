import { Widget } from "../Widget";

export class DivContent
{
    id: string = '';
    w: Widget[]

    constructor(id: string, ...w: Widget[])
    {
        this.id = id;
        this.w = w;
    }
}