using System;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace JavaScriptErrorReporter.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateInput(false)]
        public EmptyResult Report(string error)
        {
            var stackTrace = Request.Form.GetValues("stackTrace[]");

            if (!String.IsNullOrWhiteSpace(error) && stackTrace != null && stackTrace.Any())
            {
                var hash = GetUniqueHash(stackTrace);
                ReportError(error, stackTrace, hash);
            }
                
            return new EmptyResult();
        }

        private static readonly Regex LineCleaner
            = new Regex(@"\([^\)]+\)$", RegexOptions.Compiled);

        private int GetUniqueHash(string[] stackTrace)
        {
            var sb = new StringBuilder();

            foreach (var stackLine in stackTrace)
            {
                var cleanLine = LineCleaner
                    .Replace(stackLine, String.Empty)
                    .Trim();

                if (!String.IsNullOrWhiteSpace(cleanLine))
                    sb.AppendLine(cleanLine);
            }

            return sb
                .ToString()
                .ToLowerInvariant()
                .GetHashCode();
        }

        private void ReportError(string error, string[] stackTrace, int hash)
        {
            // TODO
        }
    }
}
