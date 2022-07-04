using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools.AppBuildActions
{
    internal class RemoveLine : IAppBuildAction
    {
        private readonly int line;

        public RemoveLine(int line)
        {
            this.line = line;
        }

        public void Run(ref string[] fileContentLines)
        {
            fileContentLines[line] = null;
        }

        public string ActionResume => $"remove-replace (ln:{line})";
    }
}