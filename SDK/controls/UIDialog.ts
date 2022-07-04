import { Widget } from "../Widget";
import { WidgetContext } from "../WidgetContext";
import { ICustomWidgetPresenter } from "../ICustomWidgetPresenter";
import { INotifiable } from "../INotifiable";
import { VirtualFunction } from "../VirtualFunction";
import { PageShell } from "../PageShell";
import { UITemplateView } from "./UITemplateView";
import { ModalAction } from "./ModalAction";

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

    constructor({ shell, name, title, contentTemplate, actions }:
        {
            shell: PageShell,
            name: string;
            title: string;
            contentTemplate: UITemplateView;
            actions: ModalAction[];
        })
    {
        super(name);

        this.shell = shell;
        this.titleText = title;
        this.contentTemplate = contentTemplate;
        this.modalActions = actions;

        var body: Element = shell.getPageBody();
        var modalDivContainer: Element = shell.elementById('modalContainer');
        if (modalDivContainer == null)
        {
            modalDivContainer = shell.createElement('div');
            modalDivContainer.id = 'modalContainer';
            body.appendChild(modalDivContainer);
        }

        this.modalContext = new WidgetContext(
            shell,
            [modalDivContainer.id],
            null);

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

    public show(): void
    {
        this.modalContext.addWidget('modalContainer', this);
        this.modalContext.build(this, false);
        UIDialog.$ = this;
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