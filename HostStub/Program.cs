using System;
using HelloEtoGH; // ensure the HelloEtoForm is in this namespace or adjust accordingly

namespace HostStub
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Grasshopper-like host (stub) started. Launching Eto UI...");
            // In a real Grasshopper host, this would mount the panel; here we simply launch the UI.
            FormRunner.RunHelloForm();
        }
    }
}
