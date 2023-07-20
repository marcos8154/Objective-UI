"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UIDialog = void 0;
class UIDialog extends Widget {
    constructor(shell) {
        super('UIDialog');
        this.modalActions = [];
        this.onComplete = null;
        this.shell = shell;
        // obtem o body da pagina
        var body = shell.getPageBody();
        // verifica se existe a div que vai conter o modal
        var modalDivContainer = shell.elementById('modalContainer');
        if (modalDivContainer == null) {
            // nao existe, então deve ser criada uma div-container 
            // para controlar o modal
            modalDivContainer = shell.createElement('div');
            modalDivContainer.id = 'modalContainer';
            body.appendChild(modalDivContainer);
        }
        // é criado um WidgetContext para gerenciar a div
        // container do modal
        this.modalContext = new WidgetContext(shell, [modalDivContainer.id], null);
    }
    action(action) {
        this.modalActions.push(action);
        return this;
    }
    setTitle(dialogTitle) {
        this.titleText = dialogTitle;
        return this;
    }
    setText(dialogText) {
        this.contentTemplate = new UITemplateView(dialogText, this.shell);
        return this;
    }
    useTemplate(templateView) {
        this.contentTemplate = templateView;
        return this;
    }
    htmlTemplate() {
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
    onWidgetDidLoad() {
        var self = this;
        self.titleElement = self.elementById('modalTitle');
        self.bodyContainer = self.elementById('modalBody');
        self.footerContainer = self.elementById('modalFooter');
        self.titleElement.textContent = self.titleText;
        self.modalContainer = self.elementById('fsModalView');
        if (!Misc.isNullOrEmpty(self.contentTemplate))
            self.bodyContainer.appendChild(self.contentTemplate.content());
        for (var i = 0; i < self.modalActions.length; i++) {
            const action = self.modalActions[i];
            const btn = self.shell.createElement('button');
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
        });
        self.showFunction.setContent(`
            var md = new bootstrap.Modal(document.getElementById('${self.modalContainer.id}'), { backdrop: false })
            md.show();
            $('#${self.modalContainer.id}').on('hidden.bs.modal', function (e) {
                document.getElementById('${self.modalContainer.id}').remove();
                document.getElementById('${self.showFunction.functionId}').remove();
            })`);
        self.showFunction.call();
    }
    show(onComplete) {
        this.onComplete = onComplete;
        this.modalContext.addWidget('modalContainer', this);
        this.modalContext.build(this, false);
        UIDialog.$ = this;
    }
    onNotified(sender, args) {
        if (Misc.isNull(this.onComplete) == false)
            this.onComplete(this);
    }
    setCustomPresenter(renderer) {
        renderer.render(this);
    }
    value() {
        throw new Error("Method not implemented.");
    }
    setEnabled(enabled) {
        throw new Error("Method not implemented.");
    }
    addCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    removeCSSClass(className) {
        throw new Error("Method not implemented.");
    }
    applyCSS(propertyName, propertyValue) {
        throw new Error("Method not implemented.");
    }
    setPosition(position, marginLeft, marginTop, marginRight, marginBottom, transform) {
        throw new Error("Method not implemented.");
    }
    setVisible(visible) {
        throw new Error("Method not implemented.");
    }
}
//exports.UIDialog = UIDialog;
