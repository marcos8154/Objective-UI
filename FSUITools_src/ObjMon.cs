using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    internal class ObjMon
    {
        public ObjMon(string monPath)
        {
            var exists = System.Diagnostics.Process.GetProcessesByName(System.IO.Path.GetFileNameWithoutExtension(System.Reflection.Assembly.GetEntryAssembly().Location)).Count() > 1;
            if (exists)
                Environment.Exit(0);

            MonPath = monPath;
            watch();


            Console.WriteLine("*** STARTED OBJ-MON ***");
            Console.WriteLine($"   obj-mon  > Monitoring changes in '{Program.PROJECT_DIR}'");
        }

        public string MonPath { get; }

        private void watch()
        {
            FileSystemWatcher watcher = new FileSystemWatcher();
            watcher.Path = MonPath;
            watcher.NotifyFilter = NotifyFilters.Attributes |
NotifyFilters.CreationTime |
NotifyFilters.DirectoryName |
NotifyFilters.FileName |
NotifyFilters.LastWrite |
NotifyFilters.Security |
NotifyFilters.Size;
            watcher.IncludeSubdirectories = true;
            watcher.Filter = "*.ts";
            watcher.Changed += Watcher_Changed;
            watcher.EnableRaisingEvents = true;
            //    watcher.BeginInit();
        }

        private bool busy = false;
        private static object lck = new object();

        private Tuple<string, DateTime> lastFile = null;

        private async void Watcher_Changed(object sender, FileSystemEventArgs e)
        {
            if (busy)
            {
                return;
            }
            lock (lck)
            {
                busy = true;

                FileInfo fi = new FileInfo(e.FullPath);
                DateTime now = DateTime.Now;

                if (lastFile != null)
                //    if (lastFile.Item1 == e.FullPath)
                    {
                        if ((now - lastFile.Item2).Seconds < 10)
                        {
                            Console.WriteLine($"[OBJ-MON]   >   Ignored change (too short diff-time, left {10 - (now - lastFile.Item2).Seconds}s)");
                            busy = false;
                            return;
                        }
                    }

                Console.WriteLine($"[OBJ-MON]   >   Changes detected [{e.ChangeType}]: '{e.FullPath}'");
                ProcessStartInfo pi = new ProcessStartInfo();
                pi.WorkingDirectory = Program.PROJECT_DIR;
                pi.FileName = "obj-ui.exe";
                pi.Arguments = "-build";

                pi.UseShellExecute = false;
                pi.RedirectStandardOutput = true;

                pi.CreateNoWindow = true;
                Process p = new Process();
                p.StartInfo = pi;
                p.Start();
                p.BeginOutputReadLine();

                Console.ForegroundColor = ConsoleColor.Green;
                p.OutputDataReceived += (o, a) =>
                {
                    Console.WriteLine($"[OBJ-MON]      {a.Data}");
                };


                p.WaitForExit();
                Console.ForegroundColor = ConsoleColor.White;
                /*
                string outFile = Program.Key("COMPILE_OUT");
                Console.WriteLine(File.ReadAllText(outFile));
                Console.ForegroundColor = ConsoleColor.White;
                */

                lastFile = new Tuple<string, DateTime>(e.FullPath, now);
                busy = false;
            }
        }

        private void OnChanged(object sender, FileSystemEventArgs e)
        {

        }
    }
}
