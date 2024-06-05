import { DefaultExceptionPage } from "../DefaultExceptionPage";
import { Misc } from "../Misc";
import { PageShell } from "../PageShell"
import { UIDialog } from "./UIDialog"

export class UIDialogBS5 extends UIDialog
{
  public static $: UIDialogBS5;
  constructor(shell: PageShell, height: string = '')
  {
    if (PageShell.BOOTSTRAP_VERSION_NUMBER < 5)
      throw new DefaultExceptionPage(new Error(`UIDialogBS5: this widget does not supports Bootstrap v${PageShell.BOOTSTRAP_VERSION}. Use 'UIDialog' class instead it.`))

    const tmpl = `
<div id="UIModalView" class="modal" tabindex="-1" >
  <div class="modal-dialog modal-dialog-scrollable">
    <div id="modalContent" class="modal-content shadow-lg" ${Misc.isNullOrEmpty(height) ? '' : `style="height:${height}"`}>
      <div class="modal-header">
        <h5   id="modalTitle" class="modal-title">Modal title</h5>
        <button id="btnClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div id="modalBody" class="modal-body pt-1" style="background:white">

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