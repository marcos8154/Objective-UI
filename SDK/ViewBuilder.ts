import { BindingContext } from "./BindingContext";
import { DefaultExceptionPage } from "./DefaultExceptionPage";
import { LanguageServer } from "./i18n/LanguageServer";
import { Misc } from "./Misc";
import { UIView } from "./UIView";
import { Widget, WidgetContext } from "./Widget";
import { DivContent } from "./yord-api/DivContent";

export class ViewBuilder
{

    public targetId: string;
    public layoutPath: string = '';
    public viewContent: DivContent[] = []
    public layoutHtml: string = null;
    private onLoadFn: Function;
    preventClear: boolean;
    dictionaryEnabled: boolean;


    private constructor(layoutPath: string)
    {
        if (Misc.isNullOrEmpty(layoutPath))
            throw new Error('UIFlatView build failed: layoutPath is required.');
        this.layoutPath = layoutPath;
    }


    private static layoutResolverFn: Function;
    public static setLayoutResolverFn(resolverFn: Function)
    {
        ViewBuilder.layoutResolverFn = resolverFn;
    }

    public static from(layoutPath: string): ViewBuilder
    {
        var path = layoutPath;
        if (!Misc.isNull(ViewBuilder.layoutResolverFn))
            path = ViewBuilder.layoutResolverFn(path);
        return new ViewBuilder(path);
    }

    public to(targetDivID: string): ViewBuilder
    {
        this.targetId = targetDivID;
        return this;
    }

    public preventClearFragment(): ViewBuilder
    {
        this.preventClear = true
        return this;
    }

    public useDictionary(): ViewBuilder
    {
        this.dictionaryEnabled = true
        return this;
    }

    private viewModelBind: any | object = null;

    public bindWith<TViewModel>(instance: TViewModel): ViewBuilder
    {
        this.viewModelBind = instance;
        return this;
    }

    private modelValidations: any[] = []
    public validate(propertyName: string, validateFn: Function): ViewBuilder
    {
        if (Misc.isNull(this.viewModelBind))
            throw new DefaultExceptionPage(new Error(`UIFlatViewBuilder: invalid call validate() function before calling bindingWith<>()`))
        this.modelValidations.push({ propertyName, validateFn })
        return this;
    }

    public hasBinding()
    {
        return Misc.isNull(this.viewModelBind) == false;
    }

    public getBinding(view: UIView): BindingContext<any | object>
    {
        const ctx = new BindingContext(this.viewModelBind, view);
        for (var v = 0; v < this.modelValidations.length; v++)
        {
            const valid = this.modelValidations[v]
            ctx.hasValidation(valid.propertyName, valid.validateFn)
        }
        return ctx;
    }

    public put(divId: string, ...w: Widget[]): ViewBuilder
    {
        this.viewContent.push(
            new DivContent(divId, ...w)
        );
        return this;
    }

    public helper(helperFn: Function): ViewBuilder
    {
        helperFn(this);
        return this;
    }

    public onLoad(fn: Function): ViewBuilder
    {
        this.onLoadFn = fn;
        return this;
    }

    callLoadFn(ctx: WidgetContext)
    {
        if (!Misc.isNull(this.onLoadFn))
            this.onLoadFn(ctx);
    }

    public languageSrv: LanguageServer = null

    public i18n(language: LanguageServer): ViewBuilder
    {
        this.languageSrv = language
        return this

    }
}