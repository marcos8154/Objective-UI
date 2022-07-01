import { FSListView } from "./FSListView";
import { IListItemTemplate } from "./IListItemTemplate";

export interface IListItemTemplateProvider
{
    getListItemTemplate(sender: FSListView, viewModel: any|object): IListItemTemplate;
}