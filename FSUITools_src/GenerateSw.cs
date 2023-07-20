using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace ObjUITools
{
    internal class GenerateSw
    {
        public void GenSw()
        {
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

            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("   *** GENERATING SERVICE WORKER ***");


            StringBuilder sb = new StringBuilder();
            foreach (FileInfo f in distDi.GetFiles("*", SearchOption.AllDirectories))
            {
                if (f.Name.Contains("tsconfig")) continue;

           
                string fName = f.FullName.Replace(distDi.FullName, "").Replace("\\", "/");
                string refer = $"'{fName}',";
                sb.AppendLine(refer);

                Console.ForegroundColor = ConsoleColor.Green;
                Console.Write($"   added referenced ");
                Console.ForegroundColor = ConsoleColor.Blue;
                Console.Write($"'{fName}'");
                Console.ForegroundColor = ConsoleColor.Green;
                Console.Write(" to ServiceWorker file");
                Console.WriteLine("");
            }

            string selfExeDir = new FileInfo(Assembly.GetExecutingAssembly().Location).Directory.FullName;
            string template = File.ReadAllText(Path.Combine(selfExeDir, "SW.js"));
            template = template.Replace("$_APP", sb.ToString());

            string swPath = Path.Combine(distDi.FullName, "SW.js");
            File.WriteAllText(swPath, template);

            Console.ForegroundColor = ConsoleColor.White;
            Console.Write($"   ServiceWorker file done!");
            Console.ForegroundColor = ConsoleColor.Blue;
            Console.Write($" '{swPath}'");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("\n");

            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(@"IMPORTANT!!!
Ensure that 'SW.js' file is referenced in 'src/index.html' file
to activate ServiceWorker in Browser:
");

            Console.ForegroundColor = ConsoleColor.Blue;
            Console.WriteLine(@"
<script src=""SW.js""></script>
<script>
    if ('serviceWorker' in navigator)
    {
        navigator.serviceWorker.register('SW.js');
    }
</script>
");

            Console.ForegroundColor = ConsoleColor.White;

        }
    }
}
