import { CustomDataGridItemTemplate } from "./CustomDataGridItemTemplate";
import { MyAPISimulator } from "./MyAPISimulator";
import { APIResponse, BindingContext, IDataGridItemTemplate, IDataGridItemTemplateProvider, UIButton, UIDataGrid, UIHead, UITextBox, UIView, ViewLayout, WebAPI, WebAPISimulator } from "./Objective-UI";

export class ContactViewModel
{
    public contactId: number = 0;
    public name: string = '';
    public mail: string = '';
    public phone: string = '';

}

export class SimpleFormWithAPI extends UIView implements IDataGridItemTemplateProvider
{
    static $: SimpleFormWithAPI;

    title = new UIHead({ name: 'hd', headType: 'h2', text: 'Form example' })
    id = new UITextBox({ name: 'txcontactId', type: 'number', title: 'Contact Id' })
    name = new UITextBox({ name: 'txname', title: 'Contact Name' });
    mail = new UITextBox({ name: 'txmail', title: 'Contact Mail' });
    phone = new UITextBox({ name: 'txphone', type: 'mail', title: 'Contact Phone' });
    btnSave = new UIButton({ name: 'btnSave', text: 'Save!', btnClass: 'btn-primary' })

    txSearch = new UITextBox({ name: 'txSearch', title: 'Search contacts', placeHolder: 'Type contact query here' })
    gridContacts = new UIDataGrid({ name: 'dtgContacts', itemTemplateProvider: this })

    binding: BindingContext<ContactViewModel>;

    constructor()
    {
        super();
        SimpleFormWithAPI.$ = this;
        this.btnSave.onClick = this.saveContact;
    }



    buildLayout(): ViewLayout
    {
        return new ViewLayout('content')
            .fromHTML(`
            <div class="row">
                <div class="col-5">
                    <div class="row">
                        <div  id="form"  class="col-12">

                        </div>
                    </div>
                </div>
                
                <div class="col">
                    <div class="row">
                        <div id="search" class="col"> </div>
                    </div>

                    <div class="row">
                        <div id="grid" style="height:90vh; max-height: 80vh; overflow-x: scroll" class="col"> </div>
                    </div>
                </div>
            </div>
            `);
    }
    composeView(): void
    {
        this.addWidgets('form', this.title);
        this.addWidgets('form', this.id,
            this.name,
            this.mail,
            this.phone,
            this.btnSave);
        this.addWidgets('search', this.txSearch);
        this.addWidgets('grid', this.gridContacts);
    }
    onViewDidLoad(): void
    {
        WebAPI.useSimulator(new MyAPISimulator());

        this.binding = new BindingContext(new ContactViewModel(), this);

        this.gridContacts.addColumns([
            { h: 'ID', k: 'id' },
            { h: 'Contact Name', k: 'name' },
            { h: 'Phone Number', k: 'phone' },
            { h: 'Mail', k: 'mail' },
            { h: 'Actions', k: '' }
        ])

        this.listContacts();

        this.txSearch.txInput.onkeydown = function (ev: Event)
        {
            SimpleFormWithAPI.$.listContacts();
        }
    }

    listContacts()
    {
        var $ = SimpleFormWithAPI.$;
        var query = $.txSearch.getText();

        WebAPI.GET(`contacts/list/${query}`)
            .dataResultTo(function (contacts: Array<ContactViewModel>)
            {
                $.gridContacts.fromList(contacts);
            })
            .call();
    }

    saveContact(ev: Event): void
    {
        var $ = SimpleFormWithAPI.$;
        var model: ContactViewModel = $.binding.getViewModel();
        if (model.contactId == 0)
            $.addContact(model);
        else
            $.updateContact(model);
    }

    private updateContact(model: ContactViewModel)
    {
        WebAPI.PUT('contacts/update')
            .withBody(model)
            .onSuccess(function (res: APIResponse)
            {
                if (res.statusCode == 200)
                {
                    SimpleFormWithAPI.$.binding.setViewModel(new ContactViewModel());
                    SimpleFormWithAPI.$.listContacts();
                }

                else
                    alert(res.statusMessage);
            })
            .onError(function (err: Error)
            {
                alert(`${err}`);
            })
            .call();
    }

    private addContact(model: ContactViewModel)
    {
        WebAPI.POST('contacts/add')
            .withBody(model)
            .onSuccess(function (res: APIResponse)
            {
                if (res.statusCode == 200)
                {
                    SimpleFormWithAPI.$.binding.setViewModel(new ContactViewModel());
                    SimpleFormWithAPI.$.listContacts();
                }

                else
                    alert(res.statusMessage);
            })
            .onError(function (err: Error)
            {
                alert(`${err}`);
            })
            .call();
    }

    editContact(model: ContactViewModel): void
    {
        var $ = SimpleFormWithAPI.$;
        $.binding.setViewModel(model);
    }

    deleteContact(model: ContactViewModel): void
    {
        var $ = SimpleFormWithAPI.$;
        WebAPI.DELETE(`contacts/delete/${model.contactId}`)
            .onSuccess(function (res: APIResponse)
            {
                if (res.statusCode == 200)
                    $.listContacts();
                else
                    alert(res.statusMessage);
            })
            .onError(function (err: Error)
            {
                alert(`${err}`);
            })
            .call();
    }

    getDataGridItemTemplate(sender: UIDataGrid, viewModel: any): IDataGridItemTemplate
    {
        return new CustomDataGridItemTemplate(this.shellPage, viewModel,
            this.editContact, this.deleteContact);
    }
}