using Eto.Forms;
using Eto.Drawing;
using System;
using System.Collections.Generic;

namespace GrasshopperStyle
{
    public class GrasshopperStylePanel : Form
    {
        private TextBox inputTextBox;
        private NumericStepper parameterStepper;
        private DropDown algorithmDropdown;
        private Button processButton;
        private Label resultLabel;
        private ProgressBar progressBar;
        private ListBox historyListBox;
        private Drawable canvas;
        
        private List<string> processingHistory = new List<string>();
        
        public GrasshopperStylePanel()
        {
            Title = "Grasshopper-Style Component - Eto.Forms";
            ClientSize = new Size(600, 500);
            
            var mainLayout = new DynamicLayout();
            
            // Input Section
            mainLayout.AddRow(CreateInputSection());
            
            // Processing Section
            mainLayout.AddRow(CreateProcessingSection());
            
            // Results Section
            mainLayout.AddRow(CreateResultsSection());
            
            // Canvas Section
            mainLayout.AddRow(CreateCanvasSection());
            
            Content = mainLayout;
        }
        
        private Control CreateInputSection()
        {
            var groupBox = new GroupBox { Text = "Input Parameters" };
            var layout = new DynamicLayout();
            
            // Text input
            layout.AddRow("Text Input:", inputTextBox = new TextBox { 
                PlaceholderText = "Enter text parameter..." 
            });
            
            // Numeric parameter
            layout.AddRow("Numeric Parameter:", parameterStepper = new NumericStepper { 
                MinValue = 0, 
                MaxValue = 100, 
                Value = 50,
                DecimalPlaces = 2
            });
            
            // Algorithm selection
            layout.AddRow("Algorithm:", algorithmDropdown = new DropDown());
            algorithmDropdown.Items.Add("Simple Processing");
            algorithmDropdown.Items.Add("Advanced Algorithm");
            algorithmDropdown.Items.Add("Custom Function");
            algorithmDropdown.SelectedIndex = 0;
            
            groupBox.Content = layout;
            return groupBox;
        }
        
        private Control CreateProcessingSection()
        {
            var groupBox = new GroupBox { Text = "Processing" };
            var layout = new DynamicLayout();
            
            // Process button
            processButton = new Button { 
                Text = "Process",
                Size = new Size(120, 30)
            };
            processButton.Click += OnProcessClick;
            
            layout.AddRow(null, processButton);
            
            // Progress bar
            layout.AddRow("Progress:", progressBar = new ProgressBar { 
                MinValue = 0, 
                MaxValue = 100, 
                Value = 0 
            });
            
            groupBox.Content = layout;
            return groupBox;
        }
        
        private Control CreateResultsSection()
        {
            var groupBox = new GroupBox { Text = "Results" };
            var layout = new DynamicLayout();
            
            // Result label
            layout.AddRow("Result:", resultLabel = new Label { 
                Text = "Ready to process...",
                Font = Fonts.Monospace(10)
            });
            
            // History list
            layout.AddRow("History:", historyListBox = new ListBox { 
                Size = new Size(300, 100) 
            });
            
            groupBox.Content = layout;
            return groupBox;
        }
        
        private Control CreateCanvasSection()
        {
            var groupBox = new GroupBox { Text = "Visualization Canvas" };
            
            canvas = new Drawable { Size = new Size(400, 200) };
            canvas.Paint += OnCanvasPaint;
            
            groupBox.Content = canvas;
            return groupBox;
        }
        
        private void OnProcessClick(object sender, EventArgs e)
        {
            // Simulate Grasshopper processing
            var input = inputTextBox.Text;
            var parameter = parameterStepper.Value;
            var algorithm = algorithmDropdown.SelectedValue?.ToString() ?? "Simple Processing";
            
            // Update UI to show processing
            processButton.Enabled = false;
            progressBar.Value = 0;
            resultLabel.Text = "Processing...";
            
            // Simulate processing with progress updates
            var timer = new UITimer();
            var progress = 0;
            timer.Elapsed += (s, args) => {
                progress += 10;
                progressBar.Value = progress;
                
                if (progress >= 100)
                {
                    timer.Stop();
                    CompleteProcessing(input, parameter, algorithm);
                }
            };
            timer.Interval = 0.1; // 100ms
            timer.Start();
        }
        
        private void CompleteProcessing(string input, double parameter, string algorithm)
        {
            // Process the input (simulate Grasshopper algorithm)
            var result = ProcessInput(input, parameter, algorithm);
            
            // Update results
            resultLabel.Text = result;
            
            // Add to history
            var historyEntry = $"[{DateTime.Now:HH:mm:ss}] {algorithm}: {result}";
            processingHistory.Add(historyEntry);
            historyListBox.Items.Add(historyEntry);
            
            // Re-enable UI
            processButton.Enabled = true;
            progressBar.Value = 0;
            
            // Redraw canvas
            canvas.Invalidate();
        }
        
        private string ProcessInput(string input, double parameter, string algorithm)
        {
            switch (algorithm)
            {
                case "Simple Processing":
                    return $"Simple: {input} × {parameter} = {input.Length * parameter:F2}";
                    
                case "Advanced Algorithm":
                    var advanced = Math.Sin(parameter * Math.PI / 180) * input.Length;
                    return $"Advanced: sin({parameter:F1}°) × {input.Length} = {advanced:F2}";
                    
                case "Custom Function":
                    var custom = Math.Pow(input.Length, parameter / 50.0);
                    return $"Custom: {input.Length}^{parameter/50:F2} = {custom:F2}";
                    
                default:
                    return $"Unknown algorithm: {algorithm}";
            }
        }
        
        private void OnCanvasPaint(object sender, PaintEventArgs e)
        {
            var graphics = e.Graphics;
            var rect = e.ClipRectangle;
            
            // Clear background
            graphics.FillRectangle(Colors.White, rect);
            
            // Draw grid (like Grasshopper canvas)
            DrawGrid(graphics, rect);
            
            // Draw processing history visualization
            DrawHistoryVisualization(graphics, rect);
        }
        
        private void DrawGrid(Graphics graphics, Rectangle rect)
        {
            var pen = new Pen(Colors.LightGray, 1);
            
            // Draw vertical lines
            for (int x = 0; x <= rect.Width; x += 20)
            {
                graphics.DrawLine(pen, x, 0, x, rect.Height);
            }
            
            // Draw horizontal lines
            for (int y = 0; y <= rect.Height; y += 20)
            {
                graphics.DrawLine(pen, 0, y, rect.Width, y);
            }
        }
        
        private void DrawHistoryVisualization(Graphics graphics, Rectangle rect)
        {
            if (processingHistory.Count == 0) return;
            
            var pen = new Pen(Colors.Blue, 2);
            var brush = new SolidBrush(Colors.Red);
            
            // Draw history as connected points
            var points = new List<PointF>();
            var stepX = rect.Width / (float)Math.Max(processingHistory.Count, 1);
            
            for (int i = 0; i < processingHistory.Count; i++)
            {
                var x = i * stepX;
                var y = rect.Height - (i * 10) % rect.Height; // Simple visualization
                points.Add(new PointF(x, y));
            }
            
            // Draw lines connecting points
            for (int i = 1; i < points.Count; i++)
            {
                graphics.DrawLine(pen, points[i-1], points[i]);
            }
            
            // Draw points
            foreach (var point in points)
            {
                graphics.FillEllipse(brush, point.X - 3, point.Y - 3, 6, 6);
            }
        }
    }

    public class Program
    {
        [STAThread]
        static void Main()
        {
            var app = new Application();
            app.Run(new GrasshopperStylePanel());
        }
    }
}
