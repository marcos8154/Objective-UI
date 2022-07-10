export class ViewDictionaryEntry 
{
    originalId : string;
    managedId : string;

    constructor(originalId : string, managedId : string) {
        this.originalId = originalId;
        this.managedId = managedId;
    }

    getOriginalId() {
        return this.originalId;
    }

    getManagedId() {
        return this.managedId;
    }
}
