using Eto.Forms;
using Eto.Drawing;

namespace HelloEto
{
    public class HelloEtoForm : Form
    {
        public HelloEtoForm()
        {
            Title = "Hello Eto - Cross Platform";
            ClientSize = new Size(400, 300);
            
            var layout = new DynamicLayout();
            
            // Header
            layout.AddRow(new Label { 
                Text = "Hello from Eto.Forms!", 
                Font = Fonts.Sans(16, FontStyle.Bold),
                TextAlignment = TextAlignment.Center
            });
            
            // Description
            layout.AddRow(new Label { 
                Text = "This is a cross-platform UI built with Eto.Forms",
                TextAlignment = TextAlignment.Center
            });
            
            // Interactive button
            var button = new Button { 
                Text = "Click Me!",
                Size = new Size(120, 30)
            };
            button.Click += (sender, e) => {
                MessageBox.Show("Hello World! This works on Windows, macOS, and Linux!", "Eto.Forms");
            };
            
            layout.AddRow(null, button);
            
            // Platform info
            var platformLabel = new Label { 
                Text = $"Running on: {Application.Platform}",
                TextAlignment = TextAlignment.Center
            };
            layout.AddRow(platformLabel);
            
            Content = layout;
        }
    }

    public class Program
    {
        [STAThread]
        static void Main()
        {
            // Initialize the application
            var app = new Application();
            
            // Run the main form
            app.Run(new HelloEtoForm());
        }
    }
}
