"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.ViewDictionaryEntry = void 0;
class ViewDictionaryEntry {
    constructor(originalId, managedId) {
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
//exports.ViewDictionaryEntry = ViewDictionaryEntry;
