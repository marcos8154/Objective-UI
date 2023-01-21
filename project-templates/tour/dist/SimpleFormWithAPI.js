"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.SimpleFormWithAPI = //exports.ContactViewModel = void 0;
class ContactViewModel {
    constructor() {
        this.contactId = 0;
        this.name = '';
        this.mail = '';
        this.phone = '';
    }
}
//exports.ContactViewModel = ContactViewModel;
class SimpleFormWithAPI extends UIView {
    constructor() {
        super();
        this.title = new UIHead({ name: 'hd', headType: 'h2', text: 'Form example' });
        this.id = new UITextBox({ name: 'txcontactId', type: 'number', title: 'Contact Id' });
        this.name = new UITextBox({ name: 'txname', title: 'Contact Name' });
        this.mail = new UITextBox({ name: 'txmail', title: 'Contact Mail' });
        this.phone = new UITextBox({ name: 'txphone', type: 'mail', title: 'Contact Phone' });
        this.btnSave = new UIButton({ name: 'btnSave', text: 'Save!', btnClass: 'btn-primary' });
        this.txSearch = new UITextBox({ name: 'txSearch', title: 'Search contacts', placeHolder: 'Type contact query here' });
        this.gridContacts = new UIDataGrid({ name: 'dtgContacts', itemTemplateProvider: this });
        SimpleFormWithAPI.$ = this;
        this.btnSave.onClick = this.saveContact;
    }
    buildLayout() {
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
    composeView() {
        this.addWidgets('form', this.title);
        this.addWidgets('form', this.id, this.name, this.mail, this.phone, this.btnSave);
        this.addWidgets('search', this.txSearch);
        this.addWidgets('grid', this.gridContacts);
    }
    onViewDidLoad() {
        WebAPI.useSimulator(new MyAPISimulator());
        this.binding = new BindingContext(new ContactViewModel(), this);
        this.gridContacts.addColumns([
            { h: 'ID', k: 'id' },
            { h: 'Contact Name', k: 'name' },
            { h: 'Phone Number', k: 'phone' },
            { h: 'Mail', k: 'mail' },
            { h: 'Actions', k: '' }
        ]);
        this.listContacts();
        this.txSearch.txInput.onkeydown = function (ev) {
            SimpleFormWithAPI.$.listContacts();
        };
    }
    listContacts() {
        var $ = SimpleFormWithAPI.$;
        var query = $.txSearch.getText();
        WebAPI.GET(`contacts/list/${query}`)
            .dataResultTo(function (contacts) {
            $.gridContacts.fromList(contacts);
        })
            .call();
    }
    saveContact(ev) {
        var $ = SimpleFormWithAPI.$;
        var model = $.binding.getViewModel();
        if (model.contactId == 0)
            $.addContact(model);
        else
            $.updateContact(model);
    }
    updateContact(model) {
        WebAPI.PUT('contacts/update')
            .withBody(model)
            .onSuccess(function (res) {
            if (res.statusCode == 200) {
                SimpleFormWithAPI.$.binding.setViewModel(new ContactViewModel());
                SimpleFormWithAPI.$.listContacts();
            }
            else
                alert(res.statusMessage);
        })
            .onError(function (err) {
            alert(`${err}`);
        })
            .call();
    }
    addContact(model) {
        WebAPI.POST('contacts/add')
            .withBody(model)
            .onSuccess(function (res) {
            if (res.statusCode == 200) {
                SimpleFormWithAPI.$.binding.setViewModel(new ContactViewModel());
                SimpleFormWithAPI.$.listContacts();
            }
            else
                alert(res.statusMessage);
        })
            .onError(function (err) {
            alert(`${err}`);
        })
            .call();
    }
    editContact(model) {
        var $ = SimpleFormWithAPI.$;
        $.binding.setViewModel(model);
    }
    deleteContact(model) {
        var $ = SimpleFormWithAPI.$;
        WebAPI.DELETE(`contacts/delete/${model.contactId}`)
            .onSuccess(function (res) {
            if (res.statusCode == 200)
                $.listContacts();
            else
                alert(res.statusMessage);
        })
            .onError(function (err) {
            alert(`${err}`);
        })
            .call();
    }
    getDataGridItemTemplate(sender, viewModel) {
        return new CustomDataGridItemTemplate(this.shellPage, viewModel, this.editContact, this.deleteContact);
    }
}
//exports.SimpleFormWithAPI = SimpleFormWithAPI;
