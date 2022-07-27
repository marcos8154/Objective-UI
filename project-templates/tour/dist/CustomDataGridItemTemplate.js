"use strict";
class CustomDataGridItemTemplate {
    constructor(shell, modelObj, onEdit, onDelete) {
        this.shell = shell;
        this.dataModelObj = modelObj;
        this.onEditFn = onEdit;
        this.onDeleteFn = onDelete;
    }
    setOwnerDataGrid(dataGrid) {
    }
    isSelected() {
        return false;
    }
    select() {
    }
    unSelect() {
    }
    itemTemplate() {
        var template = new UITemplateView(`
            <table>
                <tbody>
                    <tr id="row-template">
                        <td id="c-id">    </td>
                        <td id="c-name">  </td>
                        <td id="c-mail">  </td>
                        <td id="c-phone"> </td>
                        <td id="c-actions">
                            <button id="btnEdit" class="btn btn-sm btn-block btn-info"> Edit </button>
                            <button id="btnDelete" class="btn btn-sm btn-block btn-danger"> Delete </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        `, this.shell);
        var row = template.elementById('row-template');
        var cId = template.elementById('c-id');
        var cName = template.elementById('c-name');
        var cMail = template.elementById('c-mail');
        var cPhone = template.elementById('c-phone');
        cId.textContent = this.dataModelObj.contactId.toString();
        cName.textContent = this.dataModelObj.name;
        cMail.textContent = this.dataModelObj.mail;
        cPhone.textContent = this.dataModelObj.phone;
        var btnEdit = template.elementById('btnEdit');
        var btnDelete = template.elementById('btnDelete');
        var self = this;
        btnEdit.onclick = function (ev) {
            self.onEditFn(self.dataModelObj);
        };
        btnDelete.onclick = function (ev) {
            self.onDeleteFn(self.dataModelObj);
        };
        return row;
    }
}
