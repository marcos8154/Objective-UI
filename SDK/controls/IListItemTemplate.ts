import { FSListView } from "./FSListView";

export interface IListItemTemplate 
{
    value: any|object;
    itemName: string;
    setOwnerList(listView: FSListView): void;
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
    itemTemplate(): HTMLAnchorElement;
}