import { LanguageEntry } from "./LanguageEntry";


export class Language
{
      constructor(name: string)
      {
            this.name = name;
      }

      public name: string;
      public entries: Array<LanguageEntry> = [];

      public addEntry(key: string, value: string): void
      {
            this.entries.push(new LanguageEntry(key, value));
      }
}
