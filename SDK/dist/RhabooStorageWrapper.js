"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.RhabooStorageWrapper = //exports.RhabooInstance = void 0;
class RhabooInstance {
    constructor() {
        this.name = null;
        this.instance = null;
    }
}
//exports.RhabooInstance = RhabooInstance;
class RhabooStorageWrapper extends AppStorage {
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
    constructor(type, schemaName) {
        super(type, schemaName);
        var rhabooInstanceType = (type == 'local' ? 'persistent' : 'perishable');
        var activate = new VirtualFunction({
            fnName: 'rhabooInstance',
            fnContent: `
                var rb = Rhaboo.${rhabooInstanceType}('${schemaName}');
                RhabooStorageWrapper.addInstance({ name: '${schemaName}', instance: rb });
            `
        });
        activate.call();
        for (var i = 0; i < RhabooStorageWrapper.INSTANCES.length; i++) {
            var instance = RhabooStorageWrapper.INSTANCES[i];
            if (instance.name == schemaName) {
                this.rhaboo = instance;
                break;
            }
        }
    }
    static addInstance(instance) {
        RhabooStorageWrapper.INSTANCES.push(instance);
    }
    write(key, value) {
        this.rhaboo.instance.write(key, value);
    }
    update(key, value) {
        this.erase(key);
        this.write(key, value);
    }
    erase(key) {
        this.rhaboo.instance.erase(key);
    }
    get(key) {
        return this.rhaboo.instance[key];
    }
}
//exports.RhabooStorageWrapper = RhabooStorageWrapper;
RhabooStorageWrapper.INSTANCES = [];
