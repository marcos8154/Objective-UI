import { Widget } from "../Widget";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { Misc } from "../Misc";

export class UISpinner extends Widget
{
    private colorCls: string;
    private initialVisible: boolean;

    public containerDiv: HTMLDivElement = null;
    public spanSpinner: HTMLSpanElement = null;

    constructor({ name, colorClass = 'text-primary', visible = true }:
        {
            name: string,
            colorClass?: string,
            visible?: boolean
        })
    {
        super(name);
        this.colorCls = (Misc.isNullOrEmpty(colorClass) ? 'text-primary' : colorClass);
        this.initialVisible = (Misc.isNull(visible) ? true : visible);
    }

    protected onWidgetDidLoad(): void
    {
        this.containerDiv = this.elementById('container');
        this.spanSpinner = this.elementById('spnSpinner');

        this.setVisible(this.initialVisible);
    }
    protected htmlTemplate(): string
    {
        var colorClass = this.colorCls;
        if (colorClass == 'primary') colorClass = 'text-primary';
        if (colorClass == '') colorClass = 'text-primary';

        return `
<div id="container" class="spinner-border ${colorClass}" role="status">
    <span id="spnSpinner" class="sr-only"/>
</div>
        `
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
    }
    public value(): string
    {
        return null;
    }
    public setEnabled(enabled: boolean): void
    {

    }
    public addCSSClass(className: string): void
    {
        this.spanSpinner.classList.remove(className);
    }
    public removeCSSClass(className: string): void
    {
        this.spanSpinner.classList.add(className);
    }
    public applyCSS(propertyName: string, propertyValue: string): void
    {
        this.spanSpinner.style.setProperty(propertyName, propertyValue);
    }
    public setPosition(position: string, marginLeft: string, marginTop: string, marginRight: string, marginBottom: string, transform?: string): void
    {

    }
    public setVisible(visible: boolean): void
    {
        this.containerDiv.hidden = (visible == false);
    }

}