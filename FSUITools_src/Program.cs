using System;
using System.Linq;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Collections.Generic;
using System.Threading;
using System.Text;
using System.Configuration;
using static System.Environment;

namespace ObjUITools
{
    public class Program
    {
        public static readonly string TOOLS_VERSION = "0.8.9";
        public static string PROJECT_DIR;
        public static string SDK_SRC_PATH;


        /// <summary>
        /// Current OS path separator char 
        /// if Windows: '\\'
        /// if Linux/UNIX: '/'
        /// </summary>
        public static readonly char SPR = Path.DirectorySeparatorChar;

        public static string Key(string appConfKey)
        {
            return ConfigurationManager.AppSettings[appConfKey];
        }

        public static void Main(string[] args)
        {
            try
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.Cyan;

                SDK_SRC_PATH = Key("SDK_PATH");

                if (SPR.Equals('\\'))
                    Console.WriteLine("*** Running on Windows Environment ***");
                if(SPR.Equals('/'))
                    Console.WriteLine("*** Running on Linux/UNIX Environment ***");

                string workDir = Directory.GetCurrentDirectory();

                if (args.Length == 0)
                {
                    string readmePath = Key("READ_ME");
                    if (File.Exists(readmePath))
                    {
                        string readMe = File.ReadAllText(readmePath);

                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.WriteLine(readMe);
                        Console.ForegroundColor = ConsoleColor.White;
                        Console.SetCursorPosition(0, 0);
                        Console.ReadKey();
                    }
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
$@"*** Objective-UI Build Tools {TOOLS_VERSION}***
    > Working Dir: {workDir}
    > SDK Dir: {SDK_SRC_PATH}
");

                if (buildSdk) BuildSDk();

                string nodePath = Key("NPM_PATH");

                if (Directory.Exists(nodePath) == false)
                {
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.WriteLine($"\n\n NPM not installed on path: '{nodePath}'");
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.Write(@"You must enter the NPM path in 'App.config' file");
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

                Console.ForegroundColor = ConsoleColor.White;
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

                string[] joinFiles = File.ReadLines($"{SDK_SRC_PATH}{SPR}join.txt")
                    .ToArray();

                DirectoryInfo di = new DirectoryInfo(SDK_SRC_PATH);
                foreach (string fName in joinFiles)
                {
                    Console.WriteLine($"    > merging {fName}...");
                    string fullName = $"{SDK_SRC_PATH}{SPR}{fName}";
                    string[] lines = File.ReadAllLines(fullName);
                    bool cutting = false;

                    foreach (string line in lines)
                    {
                        if (line.StartsWith("/**") ||
                            line.StartsWith("export class") ||
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
                bool uiPageFound = false;
                foreach (FileInfo tsFile in projDir.GetFiles("*.ts", SearchOption.AllDirectories))
                {

                    if (File.ReadAllText(tsFile.FullName).Contains("extends UIPage"))
                    {
                        string outFile = $"{tsFile.Directory.FullName}{SPR}Objective-UI.ts";
                        File.WriteAllText(outFile, sb.ToString());
                        uiPageFound = true;
                        break;
                    }
                }
                if(!uiPageFound)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"* * * 'UPage' IMPLEMENTATION NOT FOUND! CANNOT REBUILD 'Objective-UI.ts'.  * * *");
                    Console.WriteLine($"Ensure creating a .ts file containg a 'class AppName extends UIPage' in your src folder for .ts files.");
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("BUILD FAIL");
                    Environment.Exit(0);
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
            Console.ForegroundColor = ConsoleColor.White;
            string[] distFolders = Key("VALID_DIST_PROJECT_FOLDERS").Split(';');

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
            build.Build();

        }
    }
}