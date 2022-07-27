import { Misc, WebAPISimulator } from "./Objective-UI";
import { ContactViewModel } from "./SimpleFormWithAPI";

export class MyAPISimulator extends WebAPISimulator
{
    static contacts: Array<ContactViewModel> = [];

    constructor()
    {
        super();

        if (MyAPISimulator.contacts.length == 0)
        {
            MyAPISimulator.contacts.push(
                { contactId: 1, name: 'Jhon Doe     ', phone: '8888-9999', mail: 'jhondoe@email.com' },
                { contactId: 2, name: 'Ana Clarkman ', phone: '8502-9600', mail: 'ana.clark.man28@email.com' },
                { contactId: 3, name: 'Robert Martin', phone: '9600-8044', mail: 'robert.d.martin@email.com' }
            )
        }

        this.mapRoute('POST', 'contacts/add', this.addContact);
        this.mapRoute('GET', 'contacts/list', this.getContacts);
        this.mapRoute('PUT', 'contacts/update', this.updateContact);
        this.mapRoute('DELETE', 'contacts/delete', this.deleteContact);
    }

    deleteContact(params: Array<string>)
    {
        for(var i = 0; i < MyAPISimulator.contacts.length; i++)
            if(MyAPISimulator.contacts[i].contactId.toString() == params[0])
            {
                MyAPISimulator.contacts.splice(i, 1);
                break;
            }
    }

    updateContact(body: ContactViewModel)
    {
        if (Misc.isNull(body)) throw new Error('Body cannot be null');
        if (Misc.isNullOrEmpty(body.name)) throw new Error('Contact name is required');
        if (Misc.isNullOrEmpty(body.phone)) throw new Error('Contact phone is required');
        if (Misc.isNullOrEmpty(body.mail)) throw new Error('Contact mail is required');
        if (body.contactId == 0) throw new Error('Update route not allowed for non-existent contacts');

        for (var i = 0; i < MyAPISimulator.contacts.length; i++)
            if (MyAPISimulator.contacts[i].contactId == body.contactId)
                MyAPISimulator.contacts[i] = body;
    }

    addContact(body: ContactViewModel)
    {
        if (Misc.isNull(body)) throw new Error('Body cannot be null');
        if (Misc.isNullOrEmpty(body.name)) throw new Error('Contact name is required');
        if (Misc.isNullOrEmpty(body.phone)) throw new Error('Contact phone is required');
        if (Misc.isNullOrEmpty(body.mail)) throw new Error('Contact mail is required');
        if (body.contactId > 0) throw new Error('Add route not allowed for existent contacts');
        MyAPISimulator.contacts.push(body);
    }

    getContacts(params: Array<string>): Array<ContactViewModel>
    {
        if (params.length == 0)
            return MyAPISimulator.contacts;

        var search = params[0];
        const result: Array<ContactViewModel> = [];
        for (var i = 0; i < MyAPISimulator.contacts.length; i++)
        {
            var contact = MyAPISimulator.contacts[i];
            if (contact.name.indexOf(search) >= 0 ||
                contact.phone.indexOf(search) >= 0 ||
                contact.mail.indexOf(search) >= 0)
                result.push(contact);
        }
        return result;
    }

}