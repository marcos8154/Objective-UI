using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    class BuildSdk
    {
        public static void BuildSDk()
        {
            try
            {
                var srcPath = Program.SDK_SRC_PATH;
                var spr = Program.SPR;
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("*** (re) building the Objective-UI lib ***");
                Console.WriteLine("\n");

                StringBuilder sb = new StringBuilder();

                string[] joinFiles = File.ReadLines($"{srcPath}{spr}join.txt")
                    .ToArray();

                DirectoryInfo di = new DirectoryInfo(srcPath);
                foreach (string fName in joinFiles)
                {
                    Console.WriteLine($"    > merging {fName}...");
                    string fullName = $"{srcPath}{spr}{fName}";
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

                DirectoryInfo projDir = new DirectoryInfo(Program.PROJECT_DIR);
                bool uiPageFound = false;
                foreach (FileInfo tsFile in projDir.GetFiles("*.ts", SearchOption.AllDirectories))
                {

                    //   if (File.ReadAllText(tsFile.FullName).Contains("extends UIPage"))
                    {
                        string outFile = $"{tsFile.Directory.FullName}{spr}Objective-UI.ts";
                        Console.WriteLine($" > Writing out file '{outFile}'...");
                        File.WriteAllText(outFile, sb.ToString());
                        uiPageFound = true;
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
    }
}
