"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.Misc = void 0;
class Misc {
    static isNull(value) {
        return (value == null || value == undefined);
    }
    static isNullOrEmpty(value) {
        return (value == null || value == undefined || value == '');
    }
}
//exports.Misc = Misc;
