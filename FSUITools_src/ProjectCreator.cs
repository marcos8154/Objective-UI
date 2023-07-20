using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    public class ProjectCreator
    {
        private readonly string template;

        public ProjectCreator(string template = "hello-world")
        {
            if (string.IsNullOrEmpty(template))
                template = "hello-world";
            this.template = template;
        }

        public void Create()
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("Creating a new Objective-UI project here...");
            Console.ForegroundColor = ConsoleColor.White;

            Stopwatch sw = new Stopwatch();
            sw.Start();
            //
            DirectoryInfo di = new DirectoryInfo(Program.PROJECT_DIR);
            if (!di.Exists)
                Directory.CreateDirectory(di.FullName);

            if (di.GetFiles().Count() > 0 || di.GetDirectories().Count() > 0)
            {
             //   Console.ForegroundColor = ConsoleColor.Red;
            //    throw new Exception($"Directory is not empty! '{di.FullName}' (check for hidden files)");
            }
            string path = new FileInfo(Assembly.GetExecutingAssembly().Location).Directory.FullName;

            string templateFile = Path.Combine(path, "project-templates", $"{template}.zip");
            System.IO.Compression.ZipFile.ExtractToDirectory(templateFile, Program.PROJECT_DIR, true);

            sw.Stop();

            Console.WriteLine($"Done! {sw.ElapsedMilliseconds}ms");
        }
    }
}
