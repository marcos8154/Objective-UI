export interface INotifiable
{
    onNotified(sender: any, args: Array<any>): void;
}