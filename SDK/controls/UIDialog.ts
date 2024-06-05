import { Widget } from "../Widget";
import { WidgetContext } from "../WidgetContext";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { VirtualFunction } from "../VirtualFunction";
import { PageShell } from "../PageShell";
import { UITemplateView } from "./UITemplateView";
import { ModalAction } from "./ModalAction";
import { INotifiable } from "../INotifiable";
import { Misc } from "../Misc";
import { UIPage } from "../UIPage";
import { DefaultExceptionPage } from "../DefaultExceptionPage";

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
    public btnClose: HTMLButtonElement;
    public modalContent: HTMLDivElement;

    private shell: PageShell;

    private modalContext: WidgetContext;

    private height: string = null;

    private customTemplate: string = null;
    onCloseFn: Function;
    constructor(shell: PageShell, customTempl?: string, height?: string)
    {
        super('UIDialog');

        this.shell = shell;
        this.height = height;
        if (!Misc.isNullOrEmpty(customTempl))
            this.customTemplate = customTempl;
        else
        {
            if (PageShell.BOOTSTRAP_VERSION_NUMBER >= 5)
                throw new DefaultExceptionPage(new Error(`UIDialog: this widget does not supports Bootstrap v${PageShell.BOOTSTRAP_VERSION}. Use 'UIDialogBS5' class instead it.`))
        }

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

    public closeDialog()
    {
        this.modalContainer.remove();
        UIDialog.$ = null;
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

    public modalBody(templateView: UITemplateView): UIDialog
    {
        this.contentTemplate = templateView;
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

    private dataDismissAttrName: string = 'data-dismiss'
    public setDataDismisAttributeName(attrName: string)
    {
        this.dataDismissAttrName = attrName;
    }

    protected htmlTemplate(): string
    {
        if (!Misc.isNullOrEmpty(this.customTemplate))
        {
            if (this.customTemplate.indexOf('UIModalView') == -1)
                throw new Error(`UIDialog '${this.widgetName}' failed to load: custom base-template does not contains an <div/> with Id="UIModalView".`)
            if (this.customTemplate.indexOf('modalTitle') == -1)
                throw new Error(`UIDialog '${this.widgetName}' failed to load: custom base-template does not contains an Element with Id="modalTitle".`)
            if (this.customTemplate.indexOf('modalBody') == -1)
                throw new Error(`UIDialog '${this.widgetName}' failed to load: custom base-template does not contains an <div/> with Id="modalBody".`)
            if (this.customTemplate.indexOf('modalFooter') == -1)
                throw new Error(`UIDialog '${this.widgetName}' failed to load: custom base-template does not contains an <div/> with Id="modalFooter".`)

            return this.customTemplate;
        }
        var styleHeight: string = '';
        if (!Misc.isNullOrEmpty(this.height))
            styleHeight = `style="height:${this.height}"`
        return `
 <div id="UIModalView" class="modal fade" role="dialog">
    <div class="modal-dialog" role="document">        
        <div id="modalContent" class="modal-content shadow-lg" ${styleHeight}>
            <div class="modal-header">
                <h5 id="modalTitle" class="modal-title">Modal title</h5>
                <button id="btnClose" type="button" class="close" ${this.dataDismissAttrName}="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            
            <div id="modalBody" class="modal-body pt-1" style="background:white">
                
            </div>

            <div id="modalFooter" class="modal-footer">
        
            </div>
        </div>
    </div>
  </div>`;

    }

    public setHeight(height: string): UIDialog
    {
        this.height = height
        if (!Misc.isNull(this.modalContent))
            this.modalContent.style.height = height;
        return this;
    }

    protected onWidgetDidLoad(): void
    {
        var self = this;

        self.modalContainer = self.elementById('UIModalView');
        self.modalContent = self.elementById('modalContent')
        self.titleElement = self.elementById('modalTitle');
        self.bodyContainer = self.elementById('modalBody');
        self.footerContainer = self.elementById('modalFooter');
        self.btnClose = self.elementById('btnClose');
        self.titleElement.textContent = self.titleText;

        if (!Misc.isNullOrEmpty(self.contentTemplate))
            self.bodyContainer.appendChild(self.contentTemplate.content());

        for (var i = 0; i < self.modalActions.length; i++)
        {
            const action: ModalAction = self.modalActions[i];
            const btn: HTMLButtonElement = self.shell.createElement('button');
            btn.type = 'button';
            btn.id = `modalAction_${Misc.generateUUID()}`;
            btn.textContent = action.text;

            for (var c = 0; c < action.classes.length; c++)
                btn.classList.add(action.classes[c]);

            action.setButton(btn, this);
            if (action.dismis)
                btn.setAttribute(`${this.dataDismissAttrName}`, 'modal');

            self.footerContainer.appendChild(btn);
        }

        self.showFunction = new VirtualFunction({
            fnName: 'modalShow',
            fnArgNames: [
                'containerId',
                'showFunctionId'
            ],
            keepAfterCalled: true
        })
        self.showFunction.setContent(`
            var md = new bootstrap.Modal(document.getElementById(containerId), { backdrop: false })
            md.show();
            var refId = ('#' + containerId)
            $(refId).on('hidden.bs.modal', function (e) {
                document.getElementById(containerId).remove();
                document.getElementById(showFunctionId).remove();
            })
        `).call(self.modalContainer.id, self.showFunction.functionId);
    }

    private onComplete: Function = null;
    public show(onComplete?: Function): void
    {
        this.onComplete = onComplete;
        this.modalContext.addWidget('modalContainer', this);
        this.modalContext.build(this);
        UIDialog.$ = this;
    }

    public setOnCloseFn(onClose: Function)
    {
        this.onCloseFn = onClose;
        this.btnClose.onclick = () => onClose
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
}