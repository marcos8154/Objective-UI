
import { FSView } from "./FSView";

export interface ISplittableView
{

    onConnectViews(splitOwner: ISplittableView): void;
    onSplittedViewRequestExpand(send: FSView): void;
    onSplittedViewRequestShrink(send: FSView): void;
    onSplittedViewRequestClose(send: FSView): void;
    onSplittedViewDataReceive(dataScope: string, args: any, send: FSView): void;
    onSplittedViewDataRequest(dataScope: string, args: any, send: FSView): any;
}