export class Misc 
{
    public static isNull(value: any|object): boolean
    {
        return (value == null || value == undefined);
    }

    public static isNullOrEmpty(value: any|object): boolean
    {
        return (value == null || value == undefined || value == '');
    }

    /**
  * Public Domain/MIT
  * 
  * This function generates a UUID (universal unique identifier value) to bind to an HTML element
  */
    public static generateUUID()
    {
        var d = new Date().getTime();//Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        var res = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
        {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0)
            {//Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else
            {//Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            var result = (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);

            return result;
        });

        return res.split('-')[0];
    }
}