import { PageShell } from "./PageShell";
import { ViewLayout } from "./ViewLayout";

export interface ILayoutPresenter {
    renderLayout(layout: ViewLayout,  pageShell: PageShell):Element;
}