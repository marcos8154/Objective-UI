import { IListItemTemplate, PageShell, UIList, UITemplateView } from "./Objective-UI";

export class CustomListItemTemplate implements IListItemTemplate
{
    value: any;
    itemName: string;
    shell: PageShell;
    ownerList: UIList;
    selected: boolean = false;
    linkElement: HTMLAnchorElement;

    constructor(shell: PageShell)
    {
        this.shell = shell;
    }

    setOwnerList(listView: UIList): void
    {
        this.ownerList = listView;
    }
    isSelected(): boolean
    {
        return this.selected;
    }
    select(): void
    {
        this.selected = true;
        this.linkElement.classList.add('active');
    }
    unSelect(): void
    {
        this.selected = false;
        this.linkElement.classList.remove('active');
    }
    itemTemplate(): HTMLAnchorElement
    {
        var template = new UITemplateView(`
  <a id="li-item" class="list-group-item list-group-item-action flex-column align-items-start">
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1"> Custom list item template </h5>
      <small>3 days ago</small>
    </div>
    <p class="mb-1"> This item was obtained by implementing the "IListItemTemplate" interface. <br/>
This line is a snippet of HTML that has been converted to an object and appended to the UIList </p>
    <small>Footer</small>
  </a>
        `, this.shell);

        this.linkElement = template.elementById('li-item');
        return this.linkElement;
    }

}