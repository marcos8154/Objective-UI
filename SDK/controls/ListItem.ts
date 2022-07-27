import { UIList } from "./UIList";
import { IListItemTemplate } from "./IListItemTemplate";
import { Misc } from "../Misc";

export class ListItem implements IListItemTemplate
{
    public value: any | object;
    public itemName: string;
    public itemText: string;
    public itemImageSource: string;
    public itemBadgeText: string;
    private ownerList: UIList;
    public anchorElement: HTMLAnchorElement;
    public imgElement: HTMLImageElement;
    public divElement: HTMLDivElement;
    public badgeElement: HTMLSpanElement;


    private selected: boolean = false;

    constructor(name: string,
        text: string,
        value?: any | object,
        imageSrc: string = null,
        badgeText: string = null)
    {
        this.value = value;
        this.itemName = name;
        this.itemText = text;
        this.itemImageSource = imageSrc;
        this.itemBadgeText = badgeText;
    }

    public setImg(src: string): void
    {
        if (Misc.isNullOrEmpty(src))
        {
            this.imgElement.hidden = true;
            this.imgElement.width = 0;
        }
        else
        {
            if (this.imgElement.hidden == true) this.imgElement.hidden = false;
            if (this.imgElement.width == 0) this.imgElement.width = 30;
            this.imgElement.src = src;
        }
    }

    public setText(text: string): void
    {
        this.divElement.textContent = text;
    }

    public setBadgeText(badgeText: string): void
    {
        this.badgeElement.textContent = badgeText;
    }

    public setOwnerList(listView: UIList)
    {
        this.ownerList = listView;
    }

    public isSelected(): boolean
    {
        return this.selected;
    }

    public select(): void
    {
        this.selected = true;

        if (this.ownerList.customBehaviorColors)
        {
            this.anchorElement.style.color = this.ownerList.selectedForeColor;
            this.anchorElement.style.backgroundColor = this.ownerList.selectedBackColor;
        }
        else
            this.anchorElement.classList.add('active');
    }

    public unSelect(): void
    {
        this.selected = false;
        if (this.ownerList.customBehaviorColors)
        {
            this.anchorElement.style.color = this.ownerList.unSelectedForeColor;
            this.anchorElement.style.backgroundColor = this.ownerList.unSelectedBackColor;
        }
        else
            this.anchorElement.classList.remove('active');
    }

    public itemTemplate(): HTMLAnchorElement
    {
        var self = this;
        if (self.anchorElement != null)
            return self.anchorElement;

        var pageShell = self.ownerList.getPageShell();

        self.anchorElement = pageShell.createElement('a');
        self.anchorElement.style.padding = '0px';
        self.anchorElement.classList.add('list-group-item', 'align-items-center', 'list-group-item-action');
        self.anchorElement.id = this.itemName;
        self.anchorElement.onclick = function (ev)
        {
            self.ownerList.onItemClicked(self, ev);
        };

        var rowDiv = pageShell.createElement('div');
        rowDiv.style.background = 'transparent';
        rowDiv.style.height = '40px';
        rowDiv.style.marginTop = '10px'
        rowDiv.classList.add('row');

        var col10Div = pageShell.createElement('div');
        col10Div.style.paddingLeft = '25px';
        col10Div.classList.add('col-10');

        var img: HTMLImageElement = null;
        if (this.itemImageSource != null)
        {
            img = pageShell.createElement('img');
            img.src = this.itemImageSource;
            img.style.marginRight = '10px';
            img.width = 30;
            img.height = 30;

            col10Div.append(img);
        }

        col10Div.append(this.itemText);

        rowDiv.append(col10Div);

        var badgeSpan: HTMLSpanElement = null;
        if (this.itemBadgeText != null)
        {
            var col2Div = pageShell.createElement('div');
            col2Div.style.display = 'flex'
            col2Div.style.justifyContent = 'end'
            col2Div.style.alignSelf = 'center'

            col2Div.classList.add('col-2');
            badgeSpan = pageShell.createElement('span');

            badgeSpan.classList.add('badge', 'badge-success', 'badge-pill');
            badgeSpan.textContent = this.itemBadgeText;
            badgeSpan.style.marginRight = '10px'

            col2Div.append(badgeSpan);
            rowDiv.append(col2Div);
        }

        self.anchorElement.append(rowDiv);
        self.badgeElement = badgeSpan;
        self.imgElement = img;
        self.divElement = rowDiv;

        this.unSelect();
        return self.anchorElement;
    }
}