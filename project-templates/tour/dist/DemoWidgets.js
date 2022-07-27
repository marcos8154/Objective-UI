"use strict";
class DemoWidgets extends UIView {
    constructor() {
        super();
        this.buttons = [
            new UIButton({ name: 'btnLight', text: 'Light Button', btnClass: 'btn-light col-2' }),
            new UIButton({ name: 'btnPrimary', text: 'Primary Button', btnClass: 'btn-primary col-2' }),
            new UIButton({ name: 'btnSuccess', text: 'Success Button', btnClass: 'btn-success col-2' }),
            new UIButton({ name: 'btnDancer', text: 'Danger Button', btnClass: 'btn-danger col-2' }),
            new UIButton({ name: 'btnAlert', text: 'Alert Button', btnClass: 'btn-warning col-2' }),
            new UIButton({ name: 'btnInfo', text: 'Info Button', btnClass: 'btn-info col-2' }),
            new UIButton({ name: 'btnDark', text: 'Dark Button', btnClass: 'btn-dark col-2' })
        ];
        this.textBoxes = [
            new UITextBox({ name: 'txBox', title: 'TextBox', placeHolder: 'With placeholder', type: 'text' }),
            new UITextBox({ name: 'txCpf', title: 'CPF TextBox', type: 'text', mask: Mask.CPF, placeHolder: Mask.CPF }),
            new UITextBox({ name: 'txCnpj', title: 'CNPJ TextBox', type: 'text', mask: Mask.CNPJ, placeHolder: Mask.CNPJ }),
            new UITextBox({ name: 'txPhone', title: 'Phone TextBox', type: 'text', mask: Mask.PHONE, placeHolder: Mask.PHONE }),
            new UITextBox({ name: 'txDate', title: 'Date-only TextBox', type: 'text', mask: Mask.DATE, placeHolder: Mask.DATE }),
            new UITextBox({ name: 'txTime', title: 'Time-only TextBox', type: 'text', mask: Mask.TIME, placeHolder: Mask.TIME }),
            new UITextBox({ name: 'txDatetime', title: 'DateTime TextBox', type: 'text', mask: Mask.DATE_TIME, placeHolder: Mask.DATE_TIME }),
            new UITextBox({ name: 'txIP', title: 'IP Address TextBox', type: 'text', mask: Mask.IP_ADDRESS, placeHolder: Mask.IP_ADDRESS }),
            new UITextBox({ name: 'txCEP', title: 'CEP TextBox', type: 'text', mask: Mask.CEP, placeHolder: Mask.CEP }),
            new UITextBox({ name: 'txMoney', title: 'Money TextBox', type: 'text', mask: Mask.MONEY, placeHolder: Mask.MONEY }),
            new UITextBox({ name: 'txMoney2', title: 'Money2 TextBox', type: 'text', mask: Mask.MONEY2, placeHolder: Mask.MONEY2 }),
        ];
        this.spinners = [
            new UISpinner({ name: 'spnPrimary', colorClass: 'text-primary' }),
            new UISpinner({ name: 'spnSec', colorClass: 'text-secondary' }),
            new UISpinner({ name: 'spnSuc', colorClass: 'text-success' }),
            new UISpinner({ name: 'spnDan', colorClass: 'text-danger' }),
            new UISpinner({ name: 'spnWarn', colorClass: 'text-warning' }),
            new UISpinner({ name: 'spnInfo', colorClass: 'text-info' }),
            new UISpinner({ name: 'spnDark', colorClass: 'text-dark' })
        ];
        this.checkBoxes = [
            new UICheckBox({ name: 'ckOn', text: 'Checked Checkbox', checked: true }),
            new UICheckBox({ name: 'ckOff', text: 'Unchecked Checkbox' }),
        ];
        this.heads = [
            new UIHead({ name: 'h1', headType: 'h1', text: 'H1' }),
            new UIHead({ name: 'h2', headType: 'h2', text: 'H2' }),
            new UIHead({ name: 'h3', headType: 'h3', text: 'H3' }),
            new UIHead({ name: 'h4', headType: 'h4', text: 'H4' }),
            new UIHead({ name: 'h5', headType: 'h5', text: 'H5' })
        ];
        this.radioGroup = new UIRadioGroup({
            name: 'rdoOptions', title: 'UIRadioGroup:', orientation: 'horizontal',
            options: [
                { t: 'Option 1', v: 'value1' },
                { t: 'Option 2', v: 'value2' },
                { t: 'Option 3', v: 'value3' }
            ]
        });
        this.select = new UISelect({ name: 'select', title: 'UISelect:' });
        this.list = new UIList({ name: 'listView' });
        this.dataGrid = new UIDataGrid({ name: 'dtgCustomers' });
    }
    buildLayout() {
        return new ViewLayout('content')
            .fromHTML(`
            <div class="row" >
                <div  class="col-12">
                    <div class="row">
                        <div class="col">
                            <div class="row"> UIButton: </div>
                            <div id="buttons" class="row">  </div>
                        </div>
                    </div>
                    
                    <div id="inputs" class="row" style="margin-top: 15px">
                        <div class="col">
                            <div class="row"> UITextBox: </div>
                            <div id="textBox" class="row">  </div>
                        </div>
                    </div>
                    <div id="spinners" class="row" style="margin-top: 15px">
                       <div class="col">
                            <div class="row"> UISpinner: </div>
                            <div id="uiSpinner" class="row">  </div>
                        </div>
                    </div>
                    <div id="checks" class="row" style="margin-top: 15px">
                        <div class="col">
                            <div class="row"> UICheckBox: </div>
                            <div id="checkbox" class="row">  </div>
                        </div>
                    </div>
                    <div id="radio" class="row" style="margin-top: 15px">
                        <div class="col">
                            <div id="radioButtons" class="row">  </div>
                        </div>
                    </div>
                    <div id="heads" class="row" style="margin-top: 15px">
                        <div class="col">
                             <div class="row"> UIHead: </div>
                            <div id="uiheads" class="row">  </div>
                        </div>
                    </div>
                    <div id="uiSelect" class="row" style="margin-top: 15px">
                     
                    </div>
                    <div id="list" class="row" style="margin-top: 15px">
                        <div class="col">
                            <div class="row"> UIList: </div>
                            <div class="row" >  
                                <div id="uiList" style="padding:0px" class="col-10">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="datagrid" class="row" style="margin-top: 15px">
                        <div class="col">
                            <div class="row"> UIDataGrid: </div>
                            <div class="row" >  
                                <div id="uiDatagrid" style="padding:0px" class="col-10">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            `);
    }
    composeView() {
        for (var i = 0; i < this.buttons.length; i++)
            this.addWidgets('buttons', this.buttons[i]);
        for (var i = 0; i < this.textBoxes.length; i++)
            this.addWidgets('textBox', this.textBoxes[i]);
        for (var i = 0; i < this.checkBoxes.length; i++)
            this.addWidgets('checkbox', this.checkBoxes[i]);
        for (var i = 0; i < this.heads.length; i++)
            this.addWidgets('uiheads', this.heads[i]);
        for (var i = 0; i < this.spinners.length; i++)
            this.addWidgets('uiSpinner', this.spinners[i]);
        this.addWidgets('uiList', this.list);
        this.addWidgets('uiSelect', this.select);
        this.addWidgets('radioButtons', this.radioGroup);
        this.addWidgets('uiDatagrid', this.dataGrid);
    }
    onViewDidLoad() {
        for (var i = 0; i < this.buttons.length; i++)
            this.buttons[i].cssFromString('margin: 3px');
        for (var i = 0; i < this.textBoxes.length; i++)
            this.textBoxes[i].divContainer.style.margin = '3px';
        for (var i = 0; i < this.checkBoxes.length; i++)
            this.checkBoxes[i].divContainer.style.margin = '3px';
        for (var i = 0; i < this.heads.length; i++)
            this.heads[i].cssFromString('margin:3px');
        for (var i = 0; i < this.spinners.length; i++)
            this.spinners[i].containerDiv.style.margin = '3px';
        this.select.cssFromString('width: 300px');
        this.select.fromList(['Option 1', 'Option 2', 'Option 3']);
        this.list.fromList(['Option 1', 'Option 2', 'Option 3']);
        this.list.addItem(new ListItem('listCustom1', 'Default item with options', 'ic1', '/img/demo-img.png', '5'));
        this.list.addItem(new CustomListItemTemplate(this.shellPage));
        var objects = [
            { id: 1, name: 'Jhon Doe     ', phone: '8888-9999', mail: 'jhondoe@email.com' },
            { id: 2, name: 'Ana Clarkman ', phone: '8502-9600', mail: 'ana.clark.man28@email.com' },
            { id: 3, name: 'Robert Martin', phone: '9600-8044', mail: 'robert.d.martin@email.com' }
        ];
        this.dataGrid.addColumns([
            { h: 'ID', k: 'id' },
            { h: 'Contact Name', k: 'name' },
            { h: 'Phone Number', k: 'phone' },
            { h: 'Mail', k: 'mail' }
        ]);
        this.dataGrid.fromList(objects);
    }
}
