import { Misc } from "../Misc";
import { Language } from "./Language";

export abstract class LanguageServer
{
      private languages: Array<Language> = []

      protected getLanguage(name: string): Language
      {
            for (var i = 0; i < this.languages.length; i++)
                  if (this.languages[i].name == name)
                        return this.languages[i]
            return null
      }

      protected add(key: string, langName: string, value: string): void
      {
            var lang = this.getLanguage(langName)
            if (Misc.isNull(lang))
            {
                  lang = new Language(langName);
                  this.languages.push(lang)
            }

            lang.addEntry(key, value)
      }

      public translate(key: string, langName: string): string
      {
            for (var i = 0; i < this.languages.length; i++)
                  if (this.languages[i].name == langName)
                        return this.languages[i].entries.find(x => x.key == key)?.value
            return '';
      }
}