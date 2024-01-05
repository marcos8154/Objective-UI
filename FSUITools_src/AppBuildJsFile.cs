using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ObjUITools
{
    internal class AppBuildJsFile
    {
        private readonly DirectoryInfo rootDir;
        private readonly FileInfo jsFile;

        private List<IAppBuildAction> fileActions;

        public bool IsJs { get; private set; }

        public AppBuildJsFile(DirectoryInfo rootDir, FileInfo jsFile)
        {
            IsJs = jsFile.Name.EndsWith(".js");
            this.rootDir = rootDir;
            this.jsFile = jsFile;
            fileActions = new List<IAppBuildAction>();
        }

        public void AddAction(IAppBuildAction action)
        {
            fileActions.Add(action);
        }

        public virtual string BuildFile()
        {

            /*
            int start = jsFile.FullName.IndexOf("dist");
            int end = jsFile.FullName.Length - start;
            string importName = jsFile.FullName.Substring(
                    startIndex: start,
                    length: end).Replace("\\", "/");
            */

            DirectoryInfo rootJsDir = rootDir
                .GetFiles("*.js", SearchOption.AllDirectories)
                .FirstOrDefault()
                .Directory;



            FileInfo currentFlInfo = new FileInfo(jsFile.FullName);
            string importName = (currentFlInfo.Directory.Name == rootJsDir.Name
                ? $"    <script src=\"{currentFlInfo.Name}\"></script>"
                : $"    <script src=\"{currentFlInfo.Directory.FullName.Replace(rootDir.FullName, "") }/{currentFlInfo.Name}\"></script>");

            if (fileActions.Count == 0) return importName;
            string[] lines = File.ReadAllLines(jsFile.FullName);

            if (fileActions.Count > 0)
            {
                Console.ForegroundColor = ConsoleColor.DarkGreen;
                Console.WriteLine($"   > Code cleanup '{jsFile.Name}'  ({lines.Length} lines)...");
                Console.ForegroundColor = ConsoleColor.DarkCyan;
                for (int i = 0; i < fileActions.Count; i++)
                {
                    IAppBuildAction action = fileActions[i];

                    string str0 = ($"       > Action {i + 1} of {fileActions.Count}:");
                    str0 = str0.PadRight(str0.Length + 5, ' ');

                    string msg = string.Concat(
                        str0,
                        $"{action.ActionResume}"
                        );

                    Console.Write(msg);
                    Stopwatch sw = new Stopwatch();
                    sw.Start();

                    action.Run(ref lines);

                    sw.Stop();
                    Console.Write($"   OK! ~{sw.ElapsedMilliseconds}ms");
                    Console.WriteLine(string.Empty);
                }
            }

            StringBuilder sb = new StringBuilder();
            lines.ToList().ForEach(l =>
            {
                if (!string.IsNullOrEmpty(l))
                    sb.AppendLine(l);
            });
            
            string jsContent = sb.ToString();
     
            byte[] def = Encoding.Default.GetBytes(jsContent);
            string utf8enc = Encoding.UTF8.GetString(def);
            File.Delete(jsFile.FullName);
            File.WriteAllText(jsFile.FullName, jsContent, Encoding.UTF8);

            Console.ForegroundColor = ConsoleColor.White;
            return importName;
        }


        public static String ReadFileAndGetEncoding(Byte[] docBytes, ref Encoding encoding)
        {
            if (encoding == null)
                encoding = Encoding.GetEncoding(1252);
            Int32 len = docBytes.Length;
            // byte order mark for utf-8. Easiest way of detecting encoding.
            if (len > 3 && docBytes[0] == 0xEF && docBytes[1] == 0xBB && docBytes[2] == 0xBF)
            {
                encoding = new UTF8Encoding(true);
                // Note that even when initialising an encoding to have
                // a BOM, it does not cut it off the front of the input.
                return encoding.GetString(docBytes, 3, len - 3);
            }
            Boolean isPureAscii = true;
            Boolean isUtf8Valid = true;
            for (Int32 i = 0; i < len; ++i)
            {
                Int32 skip = TestUtf8(docBytes, i);
                if (skip == 0)
                    continue;
                if (isPureAscii)
                    isPureAscii = false;
                if (skip < 0)
                {
                    isUtf8Valid = false;
                    // if invalid utf8 is detected, there's no sense in going on.
                    break;
                }
                i += skip;
            }
            if (isPureAscii)
                encoding = new ASCIIEncoding(); // pure 7-bit ascii.
            else if (isUtf8Valid)
                encoding = new UTF8Encoding(false);
            // else, retain given encoding. This should be an 8-bit encoding like Windows-1252.
            return encoding.GetString(docBytes);
        }

        public static Int32 TestUtf8(Byte[] binFile, Int32 offset)
        {
            // 7 bytes (so 6 added bytes) is the maximum the UTF-8 design could support,
            // but in reality it only goes up to 3, meaning the full amount is 4.
            const Int32 maxUtf8Length = 4;
            Byte current = binFile[offset];
            if ((current & 0x80) == 0)
                return 0; // valid 7-bit ascii. Added length is 0 bytes.
            Int32 len = binFile.Length;
            for (Int32 addedlength = 1; addedlength < maxUtf8Length; ++addedlength)
            {
                Int32 fullmask = 0x80;
                Int32 testmask = 0;
                // This code adds shifted bits to get the desired full mask.
                // If the full mask is [111]0 0000, then test mask will be [110]0 0000. Since this is
                // effectively always the previous step in the iteration I just store it each time.
                for (Int32 i = 0; i <= addedlength; ++i)
                {
                    testmask = fullmask;
                    fullmask += (0x80 >> (i + 1));
                }
                // figure out bit masks from level
                if ((current & fullmask) == testmask)
                {
                    if (offset + addedlength >= len)
                        return -1;
                    // Lookahead. Pattern of any following bytes is always 10xxxxxx
                    for (Int32 i = 1; i <= addedlength; ++i)
                    {
                        if ((binFile[offset + i] & 0xC0) != 0x80)
                            return -1;
                    }
                    return addedlength;
                }
            }
            // Value is greater than the maximum allowed for utf8. Deemed invalid.
            return -1;
        }
    }
}
