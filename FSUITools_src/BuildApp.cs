using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebSdkTools.AppBuildActions;

namespace WebSdkTools
{
    internal class BuildApp
    {
        private readonly DirectoryInfo distDir;
        private readonly List<AppBuildJsFile> appFiles;
        public BuildApp(DirectoryInfo appDistDir)
        {
            distDir = appDistDir;
            appFiles = new List<AppBuildJsFile>();

            Analyze(appDistDir);
        }

        private void Analyze(DirectoryInfo rootDir)
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"Analyzing source files...");

            FileInfo[] files = rootDir.GetFiles("*.js", SearchOption.AllDirectories);
            foreach (FileInfo file in files)
            {
                if (!string.IsNullOrEmpty(file.DirectoryName))
                    if (file.DirectoryName.Contains("frontstoreSDK.libs"))
                        continue;

                Stopwatch sw = new Stopwatch();
                sw.Start();

                AppBuildJsFile appFile = new AppBuildJsFile(file);

                string[] lines = File.ReadAllLines(file.FullName);
                List<string> constReplacements = new List<string>();

                for (int i = 0; i < lines.Length; i++)
                {
                    string line = lines[i];

                    if (i == 0) continue;

                    if (line.StartsWith("Object.defineProperty"))
                        appFile.AddAction(new RemoveLine(i));
                    if (line.StartsWith("exports."))
                        appFile.AddAction(new RemoveLine(i));

                    if (line.StartsWith("const "))
                    {
                        string replacement = line
                            .Replace("const ", "")
                            .Split('=')
                            [0]
                            .TrimEnd()
                            .TrimStart();

                        constReplacements.Add(replacement);

                        appFile.AddAction(new RemoveLine(i));
                    }

                    constReplacements.ForEach(r =>
                    {
                        if (line.Contains(r) && !line.StartsWith("const "))
                            appFile.AddAction(new LineReplace(i, $"{r}.", string.Empty));
                    });

                    sw.Stop();
            
                }

                appFiles.Add(appFile);

                Console.ForegroundColor = ConsoleColor.White;
            }
        }

        public void Build(FileInfo shellPageTemplate)
        {
            StringBuilder importResults = new StringBuilder();
            foreach (AppBuildJsFile jsFile in appFiles)
                importResults.AppendLine(jsFile.BuildFile());

            if (shellPageTemplate != null)
            {
                if (shellPageTemplate.Exists)
                {
                    string templateStr = File.ReadAllText(shellPageTemplate.FullName);
                    templateStr = templateStr.Replace("@imports", importResults.ToString());

                    string templateFile = Path.Combine(distDir.FullName, "index.html");
                    File.WriteAllText(templateFile, templateStr);
                }
            }
        }
    }
}