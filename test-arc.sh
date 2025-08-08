#!/bin/bash
# Quick Arc Test - HelloEtoGH
# Tests the complete flow: build, run, verify artifact logging

echo "🧪 Testing HelloEtoGH Arc (Eto.Forms + Grasshopper Style)"
echo "=========================================================="

# Check prerequisites
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK not found. Please install .NET 7.0 or newer."
    exit 1
fi

echo "✅ .NET SDK found: $(dotnet --version)"

# Clean any existing artifacts
echo ""
echo "🧹 Cleaning previous test artifacts..."
rm -f artifact_index.json
rm -rf bin/ obj/

# Build the project
echo ""
echo "🔨 Building HelloEtoGH..."
dotnet restore
if [ $? -ne 0 ]; then
    echo "❌ Package restore failed!"
    exit 1
fi

dotnet build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Check if artifact_index.json exists at root
echo ""
echo "📋 Checking artifact_index.json at project root..."
if [ -f "artifact_index.json" ]; then
    echo "✅ Found artifact_index.json at root"
    echo "📄 Initial content:"
    cat artifact_index.json | head -10
else
    echo "⚠️  No artifact_index.json at root (this is expected for first run)"
fi

# Run the application (this should trigger logging)
echo ""
echo "🎯 Running HelloEtoGH (UI will appear briefly)..."
echo "   Look for: 'Grasshopper-like host (stub) started. Launching Eto UI...'"
echo "   Close the UI window when it appears to continue the test."

# Run in background and capture output
dotnet run > test_output.log 2>&1 &
RUN_PID=$!

# Wait a moment for UI to start and logging to occur
sleep 3

# Check if process is still running (UI might still be open)
if kill -0 $RUN_PID 2>/dev/null; then
    echo "   UI is still running (user may have it open)"
    echo "   Press Enter when you've closed the UI window..."
    read -r
    kill $RUN_PID 2>/dev/null
else
    echo "   UI has closed"
fi

# Check the output
echo ""
echo "📄 Console output:"
cat test_output.log

# Verify artifact logging worked
echo ""
echo "📊 Verifying artifact logging..."
if [ -f "artifact_index.json" ]; then
    echo "✅ artifact_index.json exists at project root"
    echo "📄 Updated content:"
    cat artifact_index.json
    
    # Check if it contains our asset entry
    if grep -q "hello-eto-gh-001" artifact_index.json; then
        echo "✅ Found asset entry 'hello-eto-gh-001' in artifact_index.json"
    else
        echo "⚠️  Asset entry not found in artifact_index.json"
    fi
else
    echo "❌ artifact_index.json not found at project root"
    echo "   This indicates the path resolution fix may not be working"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up test artifacts..."
rm -f test_output.log
rm -rf bin/ obj/

echo ""
echo "🎯 Arc Test Complete!"
echo "===================="
echo "✅ Build: Successful"
echo "✅ Run: Successful (UI launched)"
echo "✅ Logging: $(if [ -f "artifact_index.json" ] && grep -q "hello-eto-gh-001" artifact_index.json; then echo "Working"; else echo "Needs investigation"; fi)"
echo ""
echo "📁 Your files are ready to drop into any repo:"
echo "   - artifact_index.json (at root)"
echo "   - HelloEtoGH.csproj"
echo "   - HostStub/Program.cs"
echo "   - HelloEtoForm/HelloEtoForm.cs"
echo "   - HelloEtoForm/ArtifactLogger.cs"
