using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebSdkTools
{
    internal class AppBuildJsFile
    {
        private readonly FileInfo jsFile;

        private List<IAppBuildAction> fileActions;

        public AppBuildJsFile(FileInfo jsFile)
        {
            this.jsFile = jsFile;
            fileActions = new List<IAppBuildAction>();
        }

        public void AddAction(IAppBuildAction action)
        {
            fileActions.Add(action);
        }

        public string BuildFile()
        {

            /*
            int start = jsFile.FullName.IndexOf("dist");
            int end = jsFile.FullName.Length - start;
            string importName = jsFile.FullName.Substring(
                    startIndex: start,
                    length: end).Replace("\\", "/");
            */


            FileInfo info = new FileInfo(jsFile.FullName);
            string importName = $"    <script src=\"/{info.Directory.Name}/{info.Name}\"></script>";

            if (fileActions.Count == 0) return importName;
            string[] lines = File.ReadAllLines(jsFile.FullName);

            if (fileActions.Count > 0)
            {
                Console.ForegroundColor = ConsoleColor.DarkGreen;
                Console.WriteLine($"   > Code cleanup '{jsFile.Name}'  ({lines.Length} lines)...");
                Console.ForegroundColor = ConsoleColor.DarkCyan;
                for (int i = 0; i < fileActions.Count; i++)
                {
                    IAppBuildAction action = fileActions[i];

                    string str0 = ($"       > Action {i + 1} of {fileActions.Count}:");
                    str0 = str0.PadRight(str0.Length + 5, ' ');

                    string msg = string.Concat(
                        str0,
                        $"{action.ActionResume}"
                        );

                    Console.Write(msg);
                    Stopwatch sw = new Stopwatch();
                    sw.Start();

                    action.Run(ref lines);

                    sw.Stop();
                    Console.Write($"   OK! ~{sw.ElapsedMilliseconds}ms");
                    Console.WriteLine(string.Empty);
                }
            }

            StringBuilder sb = new StringBuilder();
            lines.ToList().ForEach(l =>
            {
                if (!string.IsNullOrEmpty(l))
                    sb.AppendLine(l);
            });

            File.Delete(jsFile.FullName);
            File.WriteAllText(jsFile.FullName, sb.ToString());

            Console.ForegroundColor = ConsoleColor.White;
            return importName;
        }
    }
}
