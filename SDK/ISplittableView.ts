
import { UIView } from "./UIView";

export interface ISplittableView
{

    onConnectViews(splitOwner: ISplittableView): void;
    onSplittedViewRequestExpand(send: UIView): void;
    onSplittedViewRequestShrink(send: UIView): void;
    onSplittedViewRequestClose(send: UIView): void;
    onSplittedViewDataReceive(dataScope: string, args: any, send: UIView): void;
    onSplittedViewDataRequest(dataScope: string, args: any, send: UIView): any;
}