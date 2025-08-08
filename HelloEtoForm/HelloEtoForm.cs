using Eto.Forms;
using Eto.Drawing;
using System;
using HelloEtoGH; // for ArtifactLogger, if you wire logging

namespace HelloEtoGH
{
    public static class FormRunner
    {
        public static void RunHelloForm()
        {
            // Ensure we're running the Eto message loop
            new Application().Run(new HelloEtoForm());
        }
    }

    public class HelloEtoForm : Form
    {
        public HelloEtoForm()
        {
            Title = "Hello Eto — Rhino/Grasshopper Style";
            ClientSize = new Size(360, 120);

            var label = new Label
            {
                Text = "Hello Eto (Rhino/Grasshopper style)",
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };

            var button = new Button { Text = "Click me" };
            button.Click += (s, e) => label.Text = "Hello from Eto + Grasshopper stub!";

            var layout = new DynamicLayout();
            layout.AddRow(label);
            layout.AddRow(button);

            Content = layout;

            // Optional: log this asset to artifact_index.json on startup
            try
            {
                ArtifactLogger.Log(
                    assetId: "hello-eto-gh-001",
                    name: "Hello Eto Grasshopper-Style UI",
                    type: "ui-app",
                    path: "HelloEtoGH.csproj",
                    version: "0.1.0",
                    environment: "dev",
                    notes: "Initial run log for starter UI"
                );
            }
            catch
            {
                // Best-effort logging; do not fail UI start if logging is unavailable
            }
        }
    }
}
