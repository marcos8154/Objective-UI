using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    class TSC_Caller
    {
        public static void Call(string nodePath)
        {
            ProcessStartInfo pi = new ProcessStartInfo();
            pi.FileName = Path.Combine(nodePath, "tsc");
            pi.Arguments = "--incremental";
            pi.CreateNoWindow = true;
            pi.WorkingDirectory = Program.PROJECT_DIR;
            pi.WindowStyle = ProcessWindowStyle.Hidden;
            pi.UseShellExecute = true;

            Process p = new Process();
            p.StartInfo = pi;
            p.Start();
            p.WaitForExit();
        }
    }
}
