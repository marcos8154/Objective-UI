import { Widget, WidgetContext } from "../Widget";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { UIFlatView } from "../UIFlatView";
import { INotifiable } from "../INotifiable";
import { UIPage } from "../UIPage";

export class UIToast extends Widget
{
    text: string;

    private constructor(name: string, text: string)
    {
        super(name);
        this.text = text;
    }

    toastDiv: HTMLDivElement;

    protected htmlTemplate(): string
    {
        return `
        <div class="d-flex justify-content-center">
            <style>
                .toast-info{
                    background: rgb(226, 248, 255);
                    border: solid 1px rgb(24, 167, 202);
                }
                .toast-success{
                    background: rgb(221, 255, 221);
                    border: solid 1px rgb(0, 94, 0);
                }
                .toast-error{
                    background: rgb(255, 188, 188);
                    border: solid 1px rgb(255, 79, 79);
                }
                .dv-toast {
                    opacity: 0;
                    position: absolute;
                    min-width: 100px;
                    max-width: 500px;
                    min-height: 40px;
                    margin-top: 10px;
                    z-index: 10;
                    border-radius: 8px;
         
                }
            </style>
            <div id="toast-div" class="dv-toast ${this.widgetName} ps-2 pe-2 shadow-lg d-flex justify-content-center align-items-center text-center">
                <!-- toast text -->
            </div>
        </div>
    `
    }

    protected onWidgetDidLoad(): void
    {
        this.toastDiv = this.elementById('toast-div')
        this.toastDiv.textContent = this.text
        const $ = this;
        this.toastDiv.onclick = () => $.toastDiv.remove()
    }

    public static success(text: string, targetDivId: string)
    {
        const toast = new UIToast('toast-success', text)
        UIToast.show(targetDivId, toast);
    }

    public static info(text: string, targetDivId: string)
    {
        const toast = new UIToast('toast-info', text)
        UIToast.show(targetDivId, toast);
    }



    public static error(text: string, targetDivId: string)
    {
        const toast = new UIToast('toast-error', text)
        UIToast.show(targetDivId, toast);
    }

    private static show(targetDivId: string, toast: UIToast)
    {
        const ctx = new WidgetContext(UIPage.shell, [targetDivId]);
        ctx.addWidget(targetDivId, toast);
        ctx.build(new class noty implements INotifiable
        {
            onNotified(sender: any, args: any[]): void
            {
                var is = setInterval(() =>
                {
                    if (toast.toastDiv.style.opacity == '')
                        toast.toastDiv.style.opacity = '0'

                    if (parseFloat(toast.toastDiv.style.opacity) < 1.0)
                    {
                        toast.toastDiv.style.opacity = `${parseFloat(toast.toastDiv.style.opacity) + 0.08}`;
                    }

                    else
                    {
                        clearInterval(is);
                        var t = setTimeout(() =>
                        {

                            var it = setInterval(() =>
                            {
                                if (parseFloat(toast.toastDiv.style.opacity) > 0)
                                {
                                    toast.toastDiv.style.opacity = `${parseFloat(toast.toastDiv.style.opacity) - 0.02}`;
                                }
                                else
                                {
                                    toast.toastDiv.remove();
                                    ctx.clear();
                                    clearInterval(it);
                                }
                            }, 50);

                            clearTimeout(t);
                        }, 1500);
                    }

                }, 50);
            }

        });
    }
}