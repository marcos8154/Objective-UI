import { FSDataGrid } from "./FSDataGrid";
import { IDataGridItemTemplate } from "./IDataGridItemTemplate";

export interface IDataGridItemTemplateProvider
{
    getDataGridItemTemplate(sender: FSDataGrid, viewModel: any | object): IDataGridItemTemplate;
}