using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSdkTools
{
    internal interface IAppBuildAction
    {
        string ActionResume { get; }
        void Run(ref string[] fileContentLines);
    }
}
