using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    public class ProjectCreator
    {
        private readonly string template;

        public ProjectCreator(string template = "hello-world-obj-ui")
        {
            if (string.IsNullOrEmpty(template))
                template = "hello-world-fs";
            this.template = template;
        }

        public void Create()
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("Creating a new Objective-UI project here...");
            Console.ForegroundColor = ConsoleColor.White;

            Stopwatch sw = new Stopwatch();
            sw.Start();

            string templateFile = Program.Key("TEMPLATES_PATH").Replace("{template}", template); // $@"C:\Objective-UI\project-templates\{template}.zip";
            System.IO.Compression.ZipFile.ExtractToDirectory(templateFile, Program.PROJECT_DIR);

            sw.Stop();

            Console.WriteLine($"Done! {sw.ElapsedMilliseconds}ms");
        }
    }
}
