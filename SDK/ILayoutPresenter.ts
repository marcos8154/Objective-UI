import { PageShell } from "./PageShell";
import { ViewLayout } from "./ViewLayout";

/**
 * A layout presenter's role is to read and 
 * transform into reality (DOM Div's components) the data 
 * of the `ViewLayout` class whose instance is provided 
 * by the `UIView` inherited class
 */
export interface ILayoutPresenter {
    renderLayout(layout: ViewLayout,  pageShell: PageShell):Element;
}