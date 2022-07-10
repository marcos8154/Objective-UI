
/**
 * A common abstraction for local storage resources, 
 * which can be persistent (aka 'LocalStorage') 
 * or temporary (aka 'SessionStorage')
 * */
export abstract class AppStorage
{
    protected type: string;
    protected schemaName: string;

    /**
     * To provide a concrete instance of this class, 
     * you must first implement `IAppStorageProvider` 
     * from your inherited `UIPage` class.
     * 
     * @param type 'local' or 'session'
     * @param schemaName A unique name to demarcate a data context
     */
    constructor(type: string, schemaName: string)
    {
        this.type = type;
        this.schemaName = schemaName;
    }

    /**
     * Writes a value to the Storage system. 
     * It is possible to send single data or entire objects
     * 
     * @param key A unique data identifier key
     * @param value The data itself. You can provide a simple value as a number or any text. But you can also send an entire object instance here.
     */
    public abstract write(key: string, value: any | object): void;

    /**
     * Updates a value in the storage system
     * 
     * @param key A unique data identifier key
     * @param value The data itself. You can provide a simple value as a number or any text. But you can also send an entire object instance here.
     */
    public abstract update(key: string, value: any | object): void;

    /**
     * Erases a value in the storage system
     * 
     * @param key A unique data identifier key
     */
    public abstract erase(key: string): void;

    /**
     * Retrieve a value in the storage system
     * 
     * @param key A unique data identifier key
     */
    public abstract get(key: string): any | object;
}