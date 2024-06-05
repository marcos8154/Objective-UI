import { Widget } from "../Widget";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";

export class UIProgressBar extends Widget
{
    public divContainer: HTMLDivElement
    public divProgressBar: HTMLDivElement
    backgroundCssClass: string;
    containerCssClass: string;
    initialVisibleState: boolean;

    /**
     *
     */
    constructor({ name, backgroundCssClass, containerCssClass, visible }: {
        name: string,
        backgroundCssClass?: string,
        containerCssClass?: string,
        visible?: boolean
    })
    {
        super(name);

        this.backgroundCssClass = backgroundCssClass ?? 'bg-primary';
        this.containerCssClass = containerCssClass ?? 'col';
        this.initialVisibleState = visible ?? true
    }

    protected htmlTemplate(): string
    {
        return `
<div id="UIProgressBar" class="progress ${this.containerCssClass}">
  <div id="divProgressBar" class="progress-bar ${this.backgroundCssClass}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
</div>
        `
    }
    protected onWidgetDidLoad(): void
    {
        this.divContainer = this.elementById('UIProgressBar');
        this.divProgressBar = this.elementById('divProgressBar');

        this.setVisible(this.initialVisibleState)
    }

    public setValue(value: number): void
    {
        if (value > 100) value = 100
        this.divProgressBar.style.width = `${value}%`;
        this.divProgressBar.ariaValueNow = value.toString();
    }

    public value(): number
    {
        return Number.parseInt(this.divProgressBar.ariaValueNow);
    }

    public override setVisible(visible: boolean): void
    {
        this.divContainer.style.visibility = (visible ? 'visible' : 'hidden');
    }
}