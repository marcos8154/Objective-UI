"use strict";
class App extends FSPage {
    constructor(mainDoc) {
        super(mainDoc);
        try {
            this.importLib({
                libName: 'jquery',
                jsPath: 'jquery.min.js'
            });
            this.importLib({
                libName: 'jquery-mask',
                jsPath: 'jquery.mask.js'
            });
            this.importLib({
                libName: 'fontawesome-free',
                cssPath: 'css/all.min.css'
            });
            this.importLib({
                libName: 'bootstrap-4.6.1',
                cssPath: 'bootstrap.css',
                jsPath: 'bootstrap.js'
            });
            this.importLib({
                libName: 'admin-lte',
                cssPath: 'adminlte.min.css',
                jsPath: 'adminlte.min.js'
            });
            this.navigateToView(new HelloWorldFS());
        }
        catch (error) {
            new DefaultExceptionPage(error);
        }
    }
}
