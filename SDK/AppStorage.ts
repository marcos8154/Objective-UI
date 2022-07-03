
export abstract class AppStorage
{
    protected type: string;
    protected schemaName: string;

    /**
     * 
     * @param type 'local' or 'session'
     * @param schemaName 
     */
    constructor(type: string, schemaName: string)
    {
        this.type = type;
        this.schemaName = schemaName;
    }

    public abstract write(key: string, value: any | object): void;
    public abstract update(key: string, value: any | object): void;
    public abstract erase(key: string): void;
    public abstract get(key: string): any | object;
}