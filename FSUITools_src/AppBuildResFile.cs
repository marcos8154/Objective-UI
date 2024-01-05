using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    internal class AppBuildResFile : AppBuildJsFile
    {
        private readonly DirectoryInfo rootDir;
        private readonly FileInfo resSourceFile;

        public AppBuildResFile(DirectoryInfo rootDir, FileInfo jsFile) : base(rootDir, jsFile)
        {
            this.rootDir = rootDir;
            this.resSourceFile = jsFile;
        }

        public override string BuildFile()
        {
            if (resSourceFile.Name.ToLower().Contains("index.html"))
                return "";

            string path = resSourceFile.FullName.Replace(Path.Combine(Program.PROJECT_DIR, "src"), "");
            if(path.StartsWith("\\"))
                path = path.Substring(path.IndexOf("\\") + 1);

            path = Path.Combine(rootDir.FullName, path);
            FileInfo f = new FileInfo(Path.Combine(rootDir.FullName, path));
            if (!f.Directory.Exists)
                f.Directory.Create();

            File.Copy(resSourceFile.FullName, f.FullName, true);
            return "";
        }
    }
}
