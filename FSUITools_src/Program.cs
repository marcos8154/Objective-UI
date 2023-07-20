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
        public static string TOOLS_VERSION = "TO BE DYNAMIC FROM ASM";
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
                TOOLS_VERSION = Assembly.GetExecutingAssembly().GetName().Version.ToString();

                if (!Console.IsOutputRedirected) Console.Clear();

                Console.ForegroundColor = ConsoleColor.Cyan;
                SDK_SRC_PATH = Key("SDK_PATH");

                PrintEnv();

                if (args.Length == 0)
                {
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.WriteLine($"*** Objective-UI command-line tools {TOOLS_VERSION} *** ");
                    Console.WriteLine("");
                    Console.ForegroundColor = ConsoleColor.Cyan;

                    string[] helpTxt = new string[] {
"   new-project  : create new project based on template .zip",
"   -lt          : list available template projects (zip)",
"   -p=\"path\"    : defines project root path (where 'tsconfig.json' is located)",
"   -build       : compile typescript (tsc); refact .js files; make index.html",
"   -clear       : delete only your .js code files; keep lib files;",
"   -sw          : generate Service Worker .js file with all app references",
"   -mon         : starts Monitor for watch changes in .ts files then auto-build"
                    };

                    foreach(string tx in helpTxt)
                    {
                        string[] parts = tx.Split(":");
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.Write(parts[0]);
                        Console.ForegroundColor = ConsoleColor.Blue;
                        Console.Write($"- {parts[1]}");
                        Console.WriteLine("");
                    }

                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("\nCMD > ");
             
                    string line = Console.ReadLine();
                    if (!string.IsNullOrEmpty(line))
                    {
                        string[] arr = line.Split(" ");
                        args = arr;
                    }


                }

                string workDir = Directory.GetCurrentDirectory();
                if (args.Length == 0)
                {
                    NoParamsInit();
                    return;
                }


                PROJECT_DIR = args.FirstOrDefault(a => a.StartsWith("-p="));
                if (string.IsNullOrEmpty(PROJECT_DIR))
                {
                    PrintParameterDirNotProvided();
                }
                else
                {
                    PROJECT_DIR = PROJECT_DIR.Replace("-p=", "");
                    if (Directory.Exists(PROJECT_DIR) == false)
                    {
                        PrintProjDirNotFound();
                    }
                }


                bool listTemplates = args.Any(a => a.StartsWith("-lt"));
                if(listTemplates)
                {
                    Console.ForegroundColor = ConsoleColor.Green;
                    string selfExePath = new FileInfo(Assembly.GetExecutingAssembly().Location).Directory.FullName;
                    string templatesPath = Path.Combine(selfExePath, "project-templates");
                    foreach(FileInfo f in new DirectoryInfo(templatesPath).GetFiles())
                    {
                        Console.WriteLine($"  {f.Name}");
                    }

                    Console.ForegroundColor = ConsoleColor.White;
                    return;
                }



                bool monMode = args.Any(a => a.StartsWith("-mon"));
                if (monMode)
                {
                    ObjMon mon = new ObjMon(PROJECT_DIR);
                    Console.ReadKey();
                }

                bool clear = args.Any(a => a.Equals("-c") || a.StartsWith("-clear"));
                if (clear)
                {
                    DistClear clr = new DistClear();
                    clr.Run();
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
                    PrintNotTSFilesFound();
                    return;
                }

                bool buildSdk = args.Any(a => a.StartsWith("-sdk"));
                if (buildSdk) BuildSdk.BuildSDk();

                bool buildApp = args.Any(a => a.StartsWith("-build"));
                if (buildApp)
                {
                    Console.WriteLine(
$@"*** Objective-UI Build Tools {TOOLS_VERSION} ***
    > Working Dir: {workDir}
    > SDK Dir: {SDK_SRC_PATH}
");

                    string nodePath = Key("TSC_PATH");

                    if (Directory.Exists(nodePath) == false)
                    {
                        PrintNPMNotFound(nodePath);
                        return;
                    }

                    Console.WriteLine($"    > Compilling your code");
                    Console.WriteLine($"    > Calling 'tsc' from '{nodePath}', with working directory as '{PROJECT_DIR}'");

                    // calling TSC compiller
                    TSC_Caller.Call(nodePath);

                    Console.ForegroundColor = ConsoleColor.White;
                    if (args.Any(a => a.Equals("-build")))
                        BuildApp.Build();
                    PrintDone();
                }

                bool genSw = args.Any(a => a.StartsWith("-sw"));
                if (genSw)
                {
                    GenerateSw g = new GenerateSw();
                    g.GenSw();
                }
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine(ex.Message + "\nStacktrace: " + ex.StackTrace);
                Environment.Exit(0);
            }
        }

        private static void PrintEnv()
        {
            if (SPR.Equals('\\'))
                Console.WriteLine("*** Running on Windows Environment ***");
            if (SPR.Equals('/'))
                Console.WriteLine("*** Running on Linux/UNIX Environment ***");
        }

        private static void NoParamsInit()
        {
            string readmePath = Key("READ_ME");
            if (File.Exists(readmePath))
            {
                string readMe = File.ReadAllText(readmePath);
                PrintReadMe(readMe);
            }
        }

        private static void PrintReadMe(string readMe)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(readMe);
            Console.ForegroundColor = ConsoleColor.White;
            Console.SetCursorPosition(0, 0);
            Console.ReadKey();
        }

        private static void PrintParameterDirNotProvided()
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Parameter '-p=' (project directory path), was not provided. Using called directory '{Directory.GetCurrentDirectory()}'");
            PROJECT_DIR = Directory.GetCurrentDirectory();
            Console.ForegroundColor = ConsoleColor.White;
        }

        private static void PrintProjDirNotFound()
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Project directory not found: '{PROJECT_DIR}'");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Use called directory '{Directory.GetCurrentDirectory()}' ? (y / n)");
            char resp = Console.ReadKey().KeyChar;
            Console.WriteLine("");
            if (resp == 'y')
            {
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine($"Using '{Directory.GetCurrentDirectory()}'");
                PROJECT_DIR = Directory.GetCurrentDirectory();
                Console.ForegroundColor = ConsoleColor.White;
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine($"bye!");
                Environment.Exit(0);
            }
        }

        private static void PrintNotTSFilesFound()
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Any '.ts' files found in: '{PROJECT_DIR}'");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"\n\nAbort.");
            Console.ForegroundColor = ConsoleColor.White;
        }

        private static void PrintNPMNotFound(string nodePath)
        {
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine($"\n\n NPM not installed on path: '{nodePath}'");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write(@"You must enter the NPM path in 'App.config' file");
        }

        private static void PrintDone()
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("\n\n");
            Console.WriteLine($"    *** ALL DONE  ***");
            Console.WriteLine("\n");
            Console.WriteLine($"    ***  E  N  D  ***");
            Console.ForegroundColor = ConsoleColor.White;
        }
    }
}