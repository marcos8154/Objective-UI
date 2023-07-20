using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace ObjUITools
{
    internal class TSConfig
    {
        public Compileroptions compilerOptions { get; set; }

        public static TSConfig Get(string content)
        {
            TSConfig cfg = JsonConvert.DeserializeObject<TSConfig>(content);
            return cfg;
        }
    }

    public class Compileroptions
    {
        public string module { get; set; }
        public string target { get; set; }
        public bool allowJs { get; set; }
        public bool strict { get; set; }
        public bool strictNullChecks { get; set; }
        public bool strictPropertyInitialization { get; set; }
        public bool importHelpers { get; set; }
        public bool sourceMap { get; set; }
        public bool forceConsistentCasingInFileNames { get; set; }
        public bool noImplicitAny { get; set; }
        public string outDir { get; set; }
        public bool preserveConstEnums { get; set; }
    }
}
