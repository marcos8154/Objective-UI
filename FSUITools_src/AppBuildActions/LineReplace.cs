using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ObjUITools.AppBuildActions
{
    internal class LineReplace : IAppBuildAction
    {
        private readonly int line;
        private readonly string content;
        private readonly string replaceTo;

        public LineReplace(int line, string content, string replaceTo)
        {
            this.line = line;
            this.content = content;
            this.replaceTo = replaceTo;
        }

        public void Run(ref string[] fileContentLines)
        {
            if (fileContentLines[line] == null) return;
            fileContentLines[line] =
                fileContentLines[line].Replace(content, replaceTo);
        }

        public string ActionResume => $"line-replace (ln:{line})";
    }
}
