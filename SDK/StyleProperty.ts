export class StyleProperty
{
    public name: string;
    public value: string;

    constructor(cssName: string, cssValue: string)
    {
        this.name = cssName;
        this.value = cssValue;
    }
}
