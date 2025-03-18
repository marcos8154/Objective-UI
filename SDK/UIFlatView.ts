import { BindingContext } from "./BindingContext";
import { Misc } from "./Misc";
import { PageShell } from "./PageShell";
import { ViewBuilder } from "./ViewBuilder";
import { ViewCache } from "./UIFlatViewCache";
import { UIPage } from "./UIPage";
import { UIView } from "./UIView";
import { ViewLayout } from "./ViewLayout";
import { WidgetBinderBehavior } from "./WidgetBinderBehavior";
import { DivContent } from "./yord-api/DivContent";
import { DefaultExceptionPage } from "./DefaultExceptionPage";
import { ViewDictionaryEntry } from "./ViewDictionaryEntry";
import { WidgetContext } from "./WidgetContext";
import { LanguageServer } from "./i18n/LanguageServer";

export abstract class UIFlatView extends UIView
{
    private static caches: ViewCache[] = [];
    private viewDictionary: ViewDictionaryEntry[] = [];


    private static findCached(path: string)
    {
        for (var c = 0; c < this.caches.length; c++)
        {
            const cached = this.caches[c];
            if (cached.path == path) return cached;
        }
        return null;
    }

    public static load(view: UIFlatView)
    {
        view.builder = view.buildView();

        const cached = (view.builder.dictionaryEnabled ? null : this.findCached(view.builder.layoutPath));
        if (!Misc.isNull(cached))
        {
            view.builder.layoutHtml = cached.content;
            UIPage.shell.navigateToView(view, view.builder.preventClear)
        }
        else
            ViewLayout.load(view.builder.layoutPath, function (html: string)
            {
                if (Misc.isNullOrEmpty(html) || html.indexOf('<title>Error</title>') > -1)
                    throw new DefaultExceptionPage(new Error(`No html-layout found for '${view.builder.layoutPath}'`))

                if (view.builder.dictionaryEnabled)
                {
                    var parser = new DOMParser();
                    var domObj = parser.parseFromString(html, "text/html");
                    var allIds = domObj.querySelectorAll('*[id]');

                    for (var i = 0; i < allIds.length; i++)
                    {
                        var element = allIds[i];
                        var currentId = element.getAttribute('id');
                        if (currentId != null)
                        {
                            var newId = `${currentId}_${Misc.generateUUID()}`;
                            view.addDictionaryEntry(currentId, newId);
                            element.setAttribute('id', newId);
                        }
                    }

                    html = domObj.getElementsByTagName('body')[0].innerHTML;
                }

                view.builder.layoutHtml = html;
                UIPage.shell.navigateToView(view, view.builder.preventClear)

                if (!view.builder.dictionaryEnabled)
                    UIFlatView.caches.push(new ViewCache(view.builder.layoutPath, html))
            });
    }

    /**
     * Allows 2+ instances of same UIFlatView 

    * @param originalId The Id of the element present in the HTML resource
    * @param generatedId The self-generated Id value
    */
    private addDictionaryEntry(originalId: string, generatedId: string)
    {
        var entry = new ViewDictionaryEntry(originalId, generatedId);
        this.viewDictionary.push(entry);
    }

    /**
     * Retrieves a physical element 'Id' registered in dictionary
     * @param originalId original element Id declared in html-layout
     * @returns fisical random element Id registered in dictionary
     */
    public dict(originalId: string): string
    {
        for (var i = 0; i < this.viewDictionary.length; i++)
        {
            const entry = this.viewDictionary[i];
            if (entry.originalId == originalId)
                return entry.managedId
        }
    }

    /**
         * Retrieves a physical element (HTMLElement-object) registered in dictionary
         * @param originalId original element Id declared in html-layout
         * @returns fisical random element Id registered in dictionary
     */
    public dictElement<TElement>(originalId: string): TElement
    {
        for (var i = 0; i < this.viewDictionary.length; i++)
        {
            const entry = this.viewDictionary[i];
            if (entry.originalId == originalId)
                return document.getElementById(entry.managedId) as TElement
        }
    }


    private builder: ViewBuilder;
    private binding: BindingContext<any | object>;
    protected abstract buildView(): ViewBuilder;

    buildLayout(): ViewLayout
    {
        return new ViewLayout(this.builder.targetId).fromHTML(this.builder.layoutHtml)
    }
    composeView(): void
    {
        for (var c = 0; c < this.builder.viewContent.length; c++)
        {
            var content: DivContent = this.builder.viewContent[c];

            if (this.builder.dictionaryEnabled)
                this.addWidgets(this.dict(content.id), ...content.w);
            else
                this.addWidgets(content.id, ...content.w);
        }
    }
    onViewDidLoad(): void
    {
        if (this.builder.hasBinding())
            this.binding = this.builder.getBinding(this);

        if (!Misc.isNull(this.builder.languageSrv))
        {
            try
            {
                const db = this.requestLocalStorage('i18n')
                this.translateLanguage(db.get('lang'))
            } catch { }
        }

        this.builder.callLoadFn(this.viewContext());
    }

    protected getViewModel<TViewModel>(callValidations: boolean = true): TViewModel
    {
        return this.binding.getViewModel<TViewModel>(callValidations);
    }

    protected setViewModel<TViewModel>(instance: TViewModel, updateUI: boolean = true): void
    {
        this.binding.setViewModel(instance, updateUI);
    }

    public getBindingFor(modelPropertyName: string): WidgetBinderBehavior
    {
        return this.binding.getBindingFor(modelPropertyName);
    }

    public getBindingContext<TViewModel>(): BindingContext<TViewModel>
    {
        return this.binding;
    }

    /**
     * Causes a UI refresh on all Widgets managed by this Data Binding Context
     * based on the current values of the properties/keys of the ViewModelType instance
     * 
     * (remember that the ViewModelType instance is managed by this context as well)
     */
    public bindingRefreshUI(): void
    {
        return this.getBindingContext().refreshAll();
    }


    public translateLanguage(langName: string): void
    {
        const srv = this.builder.languageSrv

        const allWidgets = this.viewContext().getAll()
        for (var w = 0; w < allWidgets.length; w++)
        {
            const widget = allWidgets[w]
            var translation = srv.translate(widget.widgetName, langName)
            if (Misc.isNullOrEmpty(translation)) continue

            try
            {
                widget.setTitle(translation)
            } catch
            {
                try
                {
                    widget.setText(translation)
                } catch { }
            }
        }
    }
}