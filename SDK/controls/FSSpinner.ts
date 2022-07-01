import { FSWidget } from "../FSWidget";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";

export class FSSpinner extends FSWidget
{
    protected onWidgetDidLoad(): void
    {
        throw new Error("Method not implemented.");
    }
    protected htmlTemplate(): string
    {
        throw new Error("Method not implemented.");
    }
    public setCustomPresenter(renderer: ICustomWidgetPresenter<FSWidget>): void
    {
        throw new Error("Method not implemented.");
    }
    public value(): string
    {
        throw new Error("Method not implemented.");
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