"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.AppStorage = void 0;
/**
 * A common abstraction for local storage features,
 * which can be persistent (aka 'LocalStorage')
 * or temporary (aka 'SessionStorage')
 * */
class AppStorage {
    /**
     * To provide a concrete instance of this class,
     * you must first implement `IAppStorageProvider`
     * from your inherited `UIPage` class.
     *
     * @param type 'local' or 'session'
     * @param schemaName A unique name to demarcate a data context
     */
    constructor(type, schemaName) {
        this.type = type;
        this.schemaName = schemaName;
    }
    toString() {
        return 'APP-STORAGE (temp. and persist data management)';
    }
}
//exports.AppStorage = AppStorage;
