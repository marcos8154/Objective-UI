import { UIList } from "./UIList";
import { IListItemTemplate } from "./IListItemTemplate";

export class ListItem implements IListItemTemplate
{
    public value: any|object;
    public itemName: string;
    public itemText: string;
    public itemImageSource: string;
    public itemBadgeText: string;
    private ownerList: UIList;
    private anchorElement: HTMLAnchorElement;

    
    constructor(name: string, 
        text: string, 
        value?: any|object,
        imageSrc: string = null, 
        badgeText: string = null)
    {
        this.value = value;
        this.itemName = name;
        this.itemText = text;
        this.itemImageSource = imageSrc;
        this.itemBadgeText = badgeText;
    }

    public setOwnerList(listView: UIList)
    {
        this.ownerList = listView;
    }

    public isSelected(): boolean
    {
        return this.anchorElement.classList.contains('active');
    }

    public select(): void
    {
        this.anchorElement.classList.add('active');
    }

    public unSelect(): void
    {
        this.anchorElement.classList.remove('active');
    }

    public itemTemplate() : HTMLAnchorElement
    {
        var self = this;
        if(self.anchorElement != null)
          return self.anchorElement;
 
        var pageShell = self.ownerList.getPageShell();

        self.anchorElement = pageShell.createElement('a');
        self.anchorElement.style.padding = '0px';
        self.anchorElement.classList.add('list-group-item', 'align-items-center', 'list-group-item-action');
        self.anchorElement.id = this.itemName;
        self.anchorElement.onclick = function(ev)
        {
            self.ownerList.onItemClicked(self, ev);
        };

        var rowDiv = pageShell.createElement('div');
        rowDiv.style.background = 'transparent';
        rowDiv.style.height = '35px';
        rowDiv.style.marginTop = '10px'
        rowDiv.classList.add('row');

        var col10Div = pageShell.createElement('div');
        col10Div.style.paddingLeft = '25px';
        col10Div.classList.add('col-10');

        if(this.itemImageSource != null)
        {
            var img = pageShell.createElement('img');
            img.src = this.itemImageSource;
            img.style.marginRight = '5px';
            img.width = 30;
            img.height = 30;

            col10Div.append(img);
        }

        col10Div.append(this.itemText);

        rowDiv.append(col10Div);

        if(this.itemBadgeText != null)
        {
            var col2Div = pageShell.createElement('div');
            col2Div.style.display = 'flex'
            col2Div.style.justifyContent = 'end'
            col2Div.style.alignSelf = 'center'

            col2Div.classList.add('col-2');
            var span = pageShell.createElement('span');

            span.classList.add('badge', 'badge-success', 'badge-pill');
            span.textContent = this.itemBadgeText;
            span.style.marginRight = '10px'
            
            col2Div.append(span);
            rowDiv.append(col2Div);
        }

        self.anchorElement.append(rowDiv);
        return self.anchorElement;
    }
}