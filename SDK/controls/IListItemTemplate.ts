import { UIList } from "./UIList";

export interface IListItemTemplate 
{
    value: any|object;
    itemName: string;
    setOwnerList(listView: UIList): void;
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
    itemTemplate(): HTMLAnchorElement;
}