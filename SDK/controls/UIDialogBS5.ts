import { PageShell } from "../PageShell"
import { UIDialog } from "./UIDialog"

export class UIDialogBS5 extends UIDialog
{
    public static $: UIDialogBS5;
    constructor(shell: PageShell, height:string = '60vh')
    {
        const tmpl = `
<div id="fsModalView" class="modal" tabindex="-1" style="height:${height}">
  <div class="modal-dialog modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5   id="modalTitle" class="modal-title">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div id="modalBody" class="modal-body">

      </div>
      <div id="modalFooter" class="modal-footer">
   
      </div>
    </div>
  </div>
</div> `

      super(shell, tmpl)
      this.setDataDismisAttributeName('data-bs-dismiss')
      UIDialogBS5.$ = this;
      UIDialog.$ = this;
    }
}