export class WidgetMessage
{
    widgetName: string;
    messageId: number;
    messageText: string;
    messageAnyObject: object;

    constructor(widgetName: string, 
        messageId: number, 
        messageText: string, 
        messageAnyObject: object)
    {
        this.widgetName = widgetName;
        this.messageId = messageId;
        this.messageText = messageText;
        this.messageAnyObject = messageAnyObject;
    }
}