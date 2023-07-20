using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ObjUITools.AppBuildActions;

namespace ObjUITools
{
    internal class BuildApp
    {
        public static void Build()
        {
            Console.WriteLine("Building app");
            Console.ForegroundColor = ConsoleColor.Green;
            DirectoryInfo projDir = new DirectoryInfo(Program.PROJECT_DIR);
            Console.ForegroundColor = ConsoleColor.White;
            string[] distFolders = Program.Key("VALID_DIST_PROJECT_FOLDERS").Split(';');

            string tsconfigJson = File.ReadAllText(Path.Combine(projDir.FullName, "tsconfig.json"));
            TSConfig cfg = TSConfig.Get(tsconfigJson);

            string outDir = cfg.compilerOptions.outDir;

            /*
            DirectoryInfo? distDir = projDir.GetDirectories()
                .FirstOrDefault(d => distFolders.Contains(d.Name));
            if (distDir == null)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("An distribution folder not found in project directory. Valid folder names: 'dist' , 'wwwroot', 'www', 'publish'");
                Environment.Exit(1);
            }
            else
                Console.WriteLine($"Distribution folder found as '{distDir.Name}' ");
            */
            DirectoryInfo outDirInfo = new DirectoryInfo(Path.Combine(projDir.FullName, outDir.Replace("/", "").Replace(".", "")));
            BuildApp build = new BuildApp(outDirInfo);
            build.BuildInternal();
        }

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
                    if (file.DirectoryName.Contains("lib"))
                        continue;

                Stopwatch sw = new Stopwatch();
                sw.Start();

                AppBuildJsFile appFile = new AppBuildJsFile(rootDir, file);

                string[] lines = File.ReadAllLines(file.FullName);
                List<string> constReplacements = new List<string>();

                for (int i = 0; i < lines.Length; i++)
                {
                    string line = lines[i];

                    if (i == 0) continue;

                    if (line.StartsWith("Object.defineProperty"))
                        appFile.AddAction(new LineReplace(i, "Object.defineProperty", "//Object.defineProperty"));
                    if (line.StartsWith("exports."))
                        appFile.AddAction(new LineReplace(i, "exports.", "//exports."));

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

        private void BuildInternal()
        {
            StringBuilder importFiles = new StringBuilder();
            foreach (AppBuildJsFile jsFile in appFiles)
                importFiles.AppendLine(jsFile.BuildFile().Trim());

            DirectoryInfo di = new DirectoryInfo(Program.PROJECT_DIR);
            FileInfo indexHtml = di
                .GetDirectories()
                .FirstOrDefault(d => d.GetFiles().Any(f => f.Name.EndsWith(".ts")))
                .GetFiles("*.html", SearchOption.AllDirectories)
                .FirstOrDefault(f => f.Name.ToLower().Equals("index.html"));

            Console.WriteLine($" > INDEX HTML FILE: {(indexHtml?.Name)}");

            if (indexHtml != null)
            {
                string htmlFileTemplateStr = File.ReadAllText(indexHtml.FullName);
                string[] importLines = importFiles.ToString().Split('\n');
                StringBuilder importsResult = new StringBuilder();
                foreach (string importLine in importLines)
                {
                    string scriptName = importLine.Replace("<script src=\"", "")
                        .Replace("\"></script>", "")
                        .Replace("\r", "")
                        .Replace(@"\", "/");
 
                    if (htmlFileTemplateStr.Contains(importLine) || htmlFileTemplateStr.Contains(scriptName))
                        continue;
                    if (importLine.ToLower().Contains("objective-ui"))
                        continue;

                    var import = $@"<script src=""{scriptName}""> </script>";
                    importsResult.AppendLine($"    {import}");
                }

                htmlFileTemplateStr = htmlFileTemplateStr.Replace("@app", importsResult.ToString());

                string templateFile = Path.Combine(distDir.FullName, "index.html");
                File.WriteAllText(templateFile, htmlFileTemplateStr);
            }

        }
    }
}