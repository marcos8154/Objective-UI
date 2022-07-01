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
}