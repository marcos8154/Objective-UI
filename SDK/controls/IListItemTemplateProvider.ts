import { UIList } from "./UIList";
import { IListItemTemplate } from "./IListItemTemplate";

export interface IListItemTemplateProvider
{
    getListItemTemplate(sender: UIList, viewModel: any|object): IListItemTemplate;
}