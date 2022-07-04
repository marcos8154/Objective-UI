import { UIDataGrid } from "./UIDataGrid";
import { IDataGridItemTemplate } from "./IDataGridItemTemplate";

export interface IDataGridItemTemplateProvider
{
    getDataGridItemTemplate(sender: UIDataGrid, viewModel: any | object): IDataGridItemTemplate;
}