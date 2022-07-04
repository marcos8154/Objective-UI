using System;
using System.Linq;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Collections.Generic;
using System.Threading;
using System.Text;

namespace ObjUITools
{
    public class Program
    {
        public static string PROJECT_DIR;
        public static string SDK_SRC_PATH;

        public static void Main(string[] args)
        {
            try
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.Cyan;

                SDK_SRC_PATH = @"C:\Objective-UI\SDK\";

                string workDir = Directory.GetCurrentDirectory();

                if (args.Length == 0)
                {
                    Console.Write("     No program args.");
                    Console.ForegroundColor = ConsoleColor.White;
                    return;
                }

                bool buildSdk = args.Any(a => a.StartsWith("-sdk"));
                PROJECT_DIR = args.FirstOrDefault(a => a.StartsWith("-p="));
                if (string.IsNullOrEmpty(PROJECT_DIR))
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"Parameter '-p=' (project directory path), was not provided. Using called directory '{Directory.GetCurrentDirectory()}'");
                    PROJECT_DIR = Directory.GetCurrentDirectory();
                    Console.ForegroundColor = ConsoleColor.White;
                }
                else
                {
                    PROJECT_DIR = PROJECT_DIR.Replace("-p=", "");
                    if (Directory.Exists(PROJECT_DIR) == false)
                    {
                        Console.ForegroundColor = ConsoleColor.Red;
                        Console.WriteLine($"Project directory not found: '{PROJECT_DIR}'");
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"Using called directory: '{Directory.GetCurrentDirectory()}'");
                        PROJECT_DIR = Directory.GetCurrentDirectory();
                        Console.ForegroundColor = ConsoleColor.White;
                    }
                }

                bool createProject = args.Any(a => a.StartsWith("new-project"));
                string template = $"{args.FirstOrDefault(a => a.StartsWith("-t="))}".Replace("-t=", "");

                if (createProject)
                {
                    ProjectCreator pc = new ProjectCreator(template);
                    pc.Create();
                    return;
                }

                DirectoryInfo di = new DirectoryInfo(PROJECT_DIR);
                if (di.GetFiles("*.ts", SearchOption.AllDirectories).Count() == 0)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"Any '.ts' files found in: '{PROJECT_DIR}'");
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"\n\nAbort.");
                    Console.ForegroundColor = ConsoleColor.White;
                    return;
                }

                Console.WriteLine(
$@"*** Objective-UI Build Tools 1.0.4 ***
    > Working Dir: {workDir}
    > SDK Dir: {SDK_SRC_PATH}
");

                if (buildSdk) BuildSDk();

                string nodePath = string.Empty;
                string[] various = Environment.GetEnvironmentVariable("Path").Split(';');
                for (int l = 0; l < various.Length; l++)
                    if (various[l].Contains("npm"))
                    {
                        nodePath = various[l];
                        break;
                    }

                if (Directory.Exists(nodePath) == false)
                {
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.WriteLine($"\n\n NPM not installed on path: '{nodePath}'");
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.Write(@"You must enter the NPM path in your system's ""Path"" (user) environment variable. Normally, on Windows systems it is in ");

                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.Write("'C:\\Users\\[USER_NAME]\\AppData\\Roaming\\npm' ");

                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.Write("- Add the correct path in the Path variable and restart your IDE.");
                    Console.ForegroundColor = ConsoleColor.White;
                    return;
                }


                Console.WriteLine($"    > Compilling your code");

                ProcessStartInfo pi = new ProcessStartInfo();
                pi.FileName = Path.Combine(nodePath, "tsc");
                pi.CreateNoWindow = true;
                pi.WorkingDirectory = PROJECT_DIR;
                pi.WindowStyle = ProcessWindowStyle.Hidden;
                pi.UseShellExecute = true;

                Process p = new Process();
                p.StartInfo = pi;
                p.Start();
                p.WaitForExit();

                Console.ForegroundColor = ConsoleColor.White;
                if (args.Any(a => a.Equals("-build")))
                    BuildApp();

                Console.ForegroundColor = ConsoleColor.Yellow;

                Console.WriteLine("\n\n");
                Console.WriteLine($"    *** ALL DONE  ***");
                Console.WriteLine("\n");
                Console.WriteLine($"    ***  E  N  D  ***");

                Environment.Exit(0);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine(ex.Message);
                Environment.Exit(0);
            }
        }

        private static void BuildSDk()
        {
            try
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("*** (re) building the Objective-UI lib ***");
                Console.WriteLine("\n");

                StringBuilder sb = new StringBuilder();

                string[] joinFiles = File.ReadLines($"{SDK_SRC_PATH}\\join.txt")
                    .ToArray();

                DirectoryInfo di = new DirectoryInfo(SDK_SRC_PATH);
                foreach (string fName in joinFiles)
                {
                    Console.WriteLine($"    > merging {fName}...");
                    string fullName = $"{SDK_SRC_PATH}\\{fName}";
                    string[] lines = File.ReadAllLines(fullName);
                    bool cutting = false;

                    foreach (string line in lines)
                    {
                        if (line.StartsWith("export class") ||
                            line.StartsWith("export abstract class") ||
                            line.StartsWith("export interface"))
                        {
                            cutting = true;
                        }

                        if (cutting)
                            sb.AppendLine(line);
                    }
                }

                DirectoryInfo projDir = new DirectoryInfo(PROJECT_DIR);
                foreach (FileInfo tsFile in projDir.GetFiles("*.ts", SearchOption.AllDirectories))
                {

                    if (File.ReadAllText(tsFile.FullName).Contains("extends Page"))
                    {
                        string outFile = $"{tsFile.Directory.FullName}\\Objective-UI.ts";
                        File.WriteAllText(outFile, sb.ToString());
                        break;
                    }
                }

                Console.ForegroundColor = ConsoleColor.White;
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine(ex.Message);
                Environment.Exit(0);
            }
        }

        private static void BuildApp()
        {
            Console.WriteLine("Building app");
            Console.ForegroundColor = ConsoleColor.Green;
            DirectoryInfo projDir = new DirectoryInfo(PROJECT_DIR);
            FileInfo shellPageTemplate = null;


            Console.ForegroundColor = ConsoleColor.White;

            string[] distFolders = new string[] {
                "dist",
                "wwwroot",
                "www",
                "publish",
                "website",
                "webroot",
                "distribution",
                "product",
                "app",
                "webapp"
            };

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

            BuildApp build = new BuildApp(distDir);
            build.Build(shellPageTemplate);

        }
    }
}