import { IDataGridItemTemplate, PageShell, UIDataGrid, UITemplateView } from "./Objective-UI";
import { ContactViewModel } from "./SimpleFormWithAPI";

export class CustomDataGridItemTemplate implements IDataGridItemTemplate
{
    value: any;
    itemName: string;
    shell: PageShell;
    dataModelObj: ContactViewModel;
    onEditFn: Function;
    onDeleteFn: Function;

    constructor(shell: PageShell,
        modelObj: ContactViewModel,
        onEdit: Function,
        onDelete: Function)
    {
        this.shell = shell;
        this.dataModelObj = modelObj;
        this.onEditFn = onEdit;
        this.onDeleteFn = onDelete;
    }

    setOwnerDataGrid(dataGrid: UIDataGrid): void
    {

    }
    isSelected(): boolean
    {
        return false;
    }
    select(): void
    {

    }
    unSelect(): void
    {

    }
    itemTemplate(): HTMLTableRowElement
    {
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

        var row: HTMLTableRowElement = template.elementById('row-template');
        var cId = template.elementById('c-id') as HTMLTableCellElement;
        var cName = template.elementById('c-name') as HTMLTableCellElement;
        var cMail = template.elementById('c-mail') as HTMLTableCellElement;
        var cPhone = template.elementById('c-phone') as HTMLTableCellElement;

        cId.textContent = this.dataModelObj.contactId.toString();
        cName.textContent = this.dataModelObj.name;
        cMail.textContent = this.dataModelObj.mail;
        cPhone.textContent = this.dataModelObj.phone;

        var btnEdit = template.elementById('btnEdit') as HTMLButtonElement;
        var btnDelete = template.elementById('btnDelete') as HTMLButtonElement;

        var self = this;
        btnEdit.onclick = function (ev: Event)
        {
            self.onEditFn(self.dataModelObj);
        }

        btnDelete.onclick = function(ev: Event)
        {
            self.onDeleteFn(self.dataModelObj);
        }

        return row;

    }

}