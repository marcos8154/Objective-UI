import { FSDataGrid } from "./FSDataGrid";

export interface IDataGridItemTemplate
{
    value: any | object;
    itemName: string;
    setOwnerDataGrid(dataGrid: FSDataGrid): void;
    isSelected(): boolean;
    select(): void;
    unSelect(): void;
    itemTemplate(): HTMLTableRowElement;
}