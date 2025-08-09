#!/bin/bash
# Eto.Forms Build and Run Script
# World-Class Expertise Development Environment

echo "🚀 Eto.Forms World-Class Expertise Development Environment"
echo "=========================================================="

# Check if .NET is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 6.0 or later."
    exit 1
fi

echo "✅ .NET SDK found: $(dotnet --version)"

# Function to build and run a project
build_and_run() {
    local project_name=$1
    local project_path=$2
    
    echo ""
    echo "🔨 Building $project_name..."
    echo "================================"
    
    cd "$project_path"
    
    # Restore packages
    echo "📦 Restoring packages..."
    dotnet restore
    
    # Build project
    echo "🔨 Building project..."
    dotnet build --configuration Release
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        
        echo ""
        echo "🎯 Running $project_name..."
        echo "================================"
        dotnet run --configuration Release
    else
        echo "❌ Build failed!"
        return 1
    fi
    
    cd - > /dev/null
}

# Main menu
while true; do
    echo ""
    echo "🎯 Select a project to build and run:"
    echo "1. HelloEto - Basic cross-platform demo"
    echo "2. GrasshopperStyle - Advanced Grasshopper-style component"
    echo "3. Build all projects"
    echo "4. Clean all projects"
    echo "5. Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            build_and_run "HelloEto" "HelloEto"
            ;;
        2)
            build_and_run "GrasshopperStyle" "GrasshopperStyle"
            ;;
        3)
            echo "🔨 Building all projects..."
            build_and_run "HelloEto" "HelloEto"
            build_and_run "GrasshopperStyle" "GrasshopperStyle"
            ;;
        4)
            echo "🧹 Cleaning all projects..."
            find . -name "bin" -type d -exec rm -rf {} + 2>/dev/null
            find . -name "obj" -type d -exec rm -rf {} + 2>/dev/null
            echo "✅ Clean complete!"
            ;;
        5)
            echo "👋 Goodbye! Keep building world-class UI!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please enter 1-5."
            ;;
    esac
done
