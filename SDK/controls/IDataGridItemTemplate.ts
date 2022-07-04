import { UIDataGrid } from "./UIDataGrid";

export interface IDataGridItemTemplate
{
    value: any | object;
    itemName: string;
    setOwnerDataGrid(dataGrid: UIDataGrid): void;
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
    itemTemplate(): HTMLTableRowElement;
}