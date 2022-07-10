
/**
 * Represents a notifiable object. Initially it is used by the 
 * WidgetContext to notify data to the UIView. \
 * But it can be used generically for any purpose.
 */
export interface INotifiable
{
    /**
     * Notifies the target class that implements this contract
     * @param sender A name-id of whoever is sending this
     * @param args  Miscellaneous arguments and parameters (it is up to the notification receiver to handle this)
     */
    onNotified(sender: any, args: Array<any>): void;
}