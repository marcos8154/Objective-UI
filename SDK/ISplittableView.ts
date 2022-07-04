
import { View } from "./UIView";

export interface ISplittableView
{

    onConnectViews(splitOwner: ISplittableView): void;
    onSplittedViewRequestExpand(send: View): void;
    onSplittedViewRequestShrink(send: View): void;
    onSplittedViewRequestClose(send: View): void;
    onSplittedViewDataReceive(dataScope: string, args: any, send: View): void;
    onSplittedViewDataRequest(dataScope: string, args: any, send: View): any;
}