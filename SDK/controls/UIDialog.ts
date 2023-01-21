import { Widget } from "../Widget";
import { WidgetContext } from "../WidgetContext";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { VirtualFunction } from "../VirtualFunction";
import { PageShell } from "../PageShell";
import { UITemplateView } from "./UITemplateView";
import { ModalAction } from "./ModalAction";
import { INotifiable } from "../INotifiable";
import { Misc } from "../Misc";

export class UIDialog extends Widget implements INotifiable
{
    public static $: UIDialog;

    private showFunction: VirtualFunction;

    public contentTemplate: UITemplateView;
    private modalActions: ModalAction[] = [];
    private titleText: string;

    public modalContainer: HTMLDivElement;
    public titleElement: HTMLHeadElement;
    public bodyContainer: HTMLDivElement;
    public footerContainer: HTMLDivElement;

    private shell: PageShell;

    private modalContext: WidgetContext;

    constructor(shell: PageShell)
    {
        super('UIDialog');

        this.shell = shell;

        // obtem o body da pagina
        var body: Element = shell.getPageBody();

        // verifica se existe a div que vai conter o modal
        var modalDivContainer: Element = shell.elementById('modalContainer');
        if (modalDivContainer == null)
        {
            // nao existe, então deve ser criada uma div-container 
            // para controlar o modal
            modalDivContainer = shell.createElement('div');
            modalDivContainer.id = 'modalContainer';
            body.appendChild(modalDivContainer);
        }

        // é criado um WidgetContext para gerenciar a div
        // container do modal
        this.modalContext = new WidgetContext(
            shell,
            [modalDivContainer.id],
            null);
    }

    public action(action: ModalAction): UIDialog
    {
        this.modalActions.push(action);
        return this;
    }

    public setTitle(dialogTitle: string): UIDialog
    {
        this.titleText = dialogTitle;
        return this;
    }

    public setText(dialogText: string): UIDialog
    {
        this.contentTemplate = new UITemplateView(dialogText, this.shell);
        return this;
    }

    public useTemplate(templateView: UITemplateView): UIDialog
    {
        this.contentTemplate = templateView;
        return this;
    }

    protected htmlTemplate(): string
    {
        return `
 <div id="fsModalView" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">        
        <div class="modal-content">
            <div class="modal-header">
                <h5 id="modalTitle" class="modal-title" id="exampleModalLongTitle">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            
            <div id="modalBody" class="modal-body">
                
            </div>

            <div id="modalFooter" class="modal-footer">
        
            </div>
        </div>
    </div>
  </div>`;

    }

    protected onWidgetDidLoad(): void
    {
        var self = this;
        self.titleElement = self.elementById('modalTitle');
        self.bodyContainer = self.elementById('modalBody');
        self.footerContainer = self.elementById('modalFooter');
        self.titleElement.textContent = self.titleText;
        self.modalContainer = self.elementById('fsModalView');

        if (!Misc.isNullOrEmpty(self.contentTemplate))
            self.bodyContainer.appendChild(self.contentTemplate.content());

        for (var i = 0; i < self.modalActions.length; i++)
        {
            const action: ModalAction = self.modalActions[i];
            const btn: HTMLButtonElement = self.shell.createElement('button');
            btn.type = 'button';
            btn.id = `modalAction_${Widget.generateUUID()}`;
            btn.textContent = action.text;

            for (var c = 0; c < action.classes.length; c++)
                btn.classList.add(action.classes[c]);

            action.setButton(btn, this);
            if (action.dismis)
                btn.setAttribute('data-dismiss', 'modal');

            self.footerContainer.appendChild(btn);
        }

        self.showFunction = new VirtualFunction({
            fnName: 'modalShow',
            fnArgNames: [],
            keepAfterCalled: true
        })

        self.showFunction.setContent(`
            var md = new bootstrap.Modal(document.getElementById('${self.modalContainer.id}'), { backdrop: false })
            md.show();
            $('#${self.modalContainer.id}').on('hidden.bs.modal', function (e) {
                document.getElementById('${self.modalContainer.id}').remove();
                document.getElementById('${self.showFunction.functionId}').remove();
            })`);


        self.showFunction.call();
    }

    private onComplete: Function = null;
    public show(onComplete?: Function): void
    {
        this.onComplete = onComplete;
        this.modalContext.addWidget('modalContainer', this);
        this.modalContext.build(this, false);
        UIDialog.$ = this;
    }

    onNotified(sender: any, args: Array<any>): void
    {
        if (Misc.isNull(this.onComplete) == false)
            this.onComplete(this);
    }

    public setCustomPresenter(renderer: ICustomWidgetPresenter<Widget>): void
    {
        renderer.render(this);
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