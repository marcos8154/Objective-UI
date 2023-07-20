using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    internal class DistClear
    {
        public DistClear()
        {

        }

        internal void Run()
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("\n\n *** DIST CLEAN ***");

            string[] distFolders = Program.Key("VALID_DIST_PROJECT_FOLDERS").Split(';');
            string projDir = Program.PROJECT_DIR;

            DirectoryInfo di = new DirectoryInfo(projDir);
            DirectoryInfo distDi = di // "dist" folder
                    .GetDirectories()
                    .FirstOrDefault(d =>
                        distFolders.Contains(d.Name)
                    );
            if (distDi == null)
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("No distribution folder yet.");
                Console.ForegroundColor = ConsoleColor.White;
                Environment.Exit(0);
                return;
            }

            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine($"Cleaning your .js files in '{distDi.FullName}'; libs and non-code files are preserved.");
            int count = 0;
            Stopwatch sw = new Stopwatch();
            sw.Start();
            foreach (FileInfo f in di.GetFiles("*.js", SearchOption.AllDirectories))
            {
                if (f.Directory.FullName.Contains($"lib{Path.DirectorySeparatorChar}"))
                {
                    Console.ForegroundColor = ConsoleColor.Blue;
                    Console.WriteLine($" Ignoring '{f.Name}' ...");
                    continue;
                }

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.Write($" Removing '{f.Name}' ...");

                Stopwatch sd = new Stopwatch();
                sd.Start();
                f.Delete();
                sd.Stop();
                Console.Write($" Ok! ~{sd.ElapsedMilliseconds}ms");
                Console.Write("\n");
                count += 1;
            }

            Console.ForegroundColor = ConsoleColor.Yellow;
            string indexHtml = Path.Combine(distDi.FullName, "index.html");
            if (File.Exists(indexHtml))
            {
                Console.WriteLine($" Removing '{indexHtml}' ...");
                Stopwatch sd = new Stopwatch();
                sd.Start();
                File.Delete(indexHtml);
                sd.Stop();
                Console.Write($" Ok! ~{sd.ElapsedMilliseconds}");
                Console.Write("\n");
                count += 1;
            }
            string tsBuild = Path.Combine(distDi.FullName, "tsconfig.tsbuildinfo");
            if (File.Exists(tsBuild))
            {
                Console.Write($" Removing '{tsBuild}' ...");

                Stopwatch sd = new Stopwatch();
                sd.Start();
                File.Delete(tsBuild);
                sd.Stop();
                Console.Write($" Ok! ~{sd.ElapsedMilliseconds}");
                Console.Write("\n");
                count += 1;

            }
            sw.Stop();

            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"\n  Clear done! {count} files in ~{sw.ElapsedMilliseconds}ms");
            Console.ForegroundColor = ConsoleColor.White;

        }
    }
}
