"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
//exports.UITemplateView = void 0;
class UITemplateView {
    constructor(htmlContent, shell) {
        this.shellPage = shell;
        this.viewDictionary = [];
        //  this.parentFragment.clear();
        var html = htmlContent;
        var parser = new DOMParser();
        var domObj = parser.parseFromString(html, "text/html");
        var allIds = domObj.querySelectorAll('*[id]');
        for (var i = 0; i < allIds.length; i++) {
            var element = allIds[i];
            var currentId = element.getAttribute('id');
            if (currentId != null) {
                var newId = `${currentId}_${Widget.generateUUID()}`;
                this.addDictionaryEntry(currentId, newId);
                element.setAttribute('id', newId);
            }
        }
        this.templateDOM = domObj;
        this.templateString = domObj.children[0].outerHTML;
    }
    content() {
        return this.templateDOM.children[0];
    }
    elementById(elementId) {
        for (var i = 0; i < this.viewDictionary.length; i++) {
            var entry = this.viewDictionary[i];
            if (entry.getOriginalId() == elementId) {
                var elementResult = this.templateDOM.getElementById(entry.getManagedId());
                if (Misc.isNull(elementResult))
                    elementResult = document.getElementById(entry.getManagedId());
                return elementResult;
            }
        }
        return null;
    }
    addDictionaryEntry(originalId, generatedId) {
        var entry = new ViewDictionaryEntry(originalId, generatedId);
        this.viewDictionary.push(entry);
    }
}
//exports.UITemplateView = UITemplateView;
