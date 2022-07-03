import { AppStorage } from "./AppStorage";
import { PageJsFunction } from "./PageJsFunction";

export class RhabooInstance
{
    public name: string = null;
    public instance: any | object = null;
}

export class RhabooStorageWrapper extends AppStorage
{
    public static INSTANCES: Array<RhabooInstance> = [];

    public static addInstance(instance: RhabooInstance): void
    {
        RhabooStorageWrapper.INSTANCES.push(instance);
    }

    private rhaboo: RhabooInstance;


    /**
     *  REQUIRED `<script src="lib/rhaboo/rhaboo.js"></script>`
     * 
     * 
     * This is an implemented portability of "Rhaboo" (https://github.com/adrianmay/rhaboo), 
     * a powerful JavaScript library that allows storing 
     * object graphs (with references) in 
     * LocalStorage or SessionStorage with great 
     * precision and consistency.
     */
    constructor(type: string, schemaName: string)
    {
        super(type, schemaName);

        var rhabooInstanceType = (type == 'local' ? 'persistent' : 'perishable');
        var activate = new PageJsFunction({
            fnName: 'rhabooInstance',
            fnContent: `
                var rb = Rhaboo.${rhabooInstanceType}('${schemaName}');
                RhabooStorageWrapper.addInstance({ name: '${schemaName}', instance: rb });
            `
        });
        activate.call();

        for (var i = 0; i < RhabooStorageWrapper.INSTANCES.length; i++)
        {
            var instance = RhabooStorageWrapper.INSTANCES[i];
            if (instance.name == schemaName)
            {
                this.rhaboo = instance;
                break;
            }
        }
    }

    public write(key: string, value: any): void
    {
        this.rhaboo.instance.write(key, value);
    }
    public update(key: string, value: any): void
    {
        this.erase(key);
        this.write(key, value);
    }
    public erase(key: string): void
    {
        this.rhaboo.instance.erase(key);
    }
    public get(key: string): any | object
    {
        return this.rhaboo.instance[key];
    }
}