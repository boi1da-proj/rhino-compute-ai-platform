# HelloEtoGH - Minimal Eto.Forms Starter

> **Copy-paste starter** for Eto.Forms UI with Grasshopper-style host stub and artifact tracking

## 🚀 Quick Start

### Prerequisites
- .NET SDK 7.x or newer
- Eto.Forms and Eto.Platform packages (auto-restored)

### Run the Project
```bash
# From project root
dotnet restore
dotnet run --project HelloEtoGH.csproj
```

### Project Structure
```
HelloEtoGH/
├── HelloEtoGH.csproj          # Main project file
├── HostStub/Program.cs        # Grasshopper-style host stub
├── HelloEtoForm/HelloEtoForm.cs # Eto.Forms UI component
├── artifact_index.json        # Asset tracking scaffold
└── README.md                  # This file
```

## 🎯 What You Get

### 1. **Hello Eto UI**
- Compact Eto.Forms interface (Hello label + button)
- Rhino/Grasshopper style layout
- Cross-platform compatibility

### 2. **Grasshopper-Style Host Stub**
- Mimics Grasshopper host launching UI
- Console output for debugging
- Ready for real Rhino integration

### 3. **Artifact Tracking**
- `artifact_index.json` scaffold
- Asset versioning and metadata
- Shadow deployment configuration

## 🔧 Next Steps

### Optional Enhancements
1. **Add logging hook** to `artifact_index.json` on UI launch/close
2. **Expand shadow deployment** with additional assets
3. **Create bootstrap script** for one-command setup

### Integration Path
- Replace host stub with real Rhino plugin
- Add data flow between UI and Grasshopper
- Implement custom controls and layouts

## 📦 Dependencies
- `Eto.Forms` (2.8.0) - Cross-platform UI framework
- `Eto.Platform` (2.8.0) - Platform-specific assemblies

## 🎨 Features
- ✅ Cross-platform UI (Windows, macOS, Linux)
- ✅ Native look-and-feel
- ✅ Event-driven architecture
- ✅ Asset tracking scaffold
- ✅ Grasshopper-style hosting pattern

---

**Ready to drop into any project root and start building!** 🎯
