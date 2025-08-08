using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace HelloEtoGH
{
    // Lightweight structure matching the scaffold in artifact_index.json
    public class AssetIndexRoot
    {
        [JsonPropertyName("artifact_index_version")]
        public int ArtifactIndexVersion { get; set; } = 1;

        [JsonPropertyName("generated_at")]
        public string GeneratedAt { get; set; } = DateTime.UtcNow.ToString("o");

        [JsonPropertyName("project")]
        public string Project { get; set; } = "HelloEtoGH";

        [JsonPropertyName("assets")]
        public List<AssetEntry> Assets { get; set; } = new List<AssetEntry>();
    }

    public class AssetEntry
    {
        public string AssetId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Path { get; set; }
        public string Version { get; set; }
        public string Checksum { get; set; }
        public List<string> Dependencies { get; set; } = new List<string>();
        public ShadowDeployment ShadowDeployment { get; set; }
        public string Environment { get; set; }
        public string Timestamp { get; set; }
        public string Notes { get; set; }
    }

    public class ShadowDeployment
    {
        public string RuntimeType { get; set; }
        public string SandboxPolicy { get; set; }
        public string[] Os { get; set; }
    }

    public static class ArtifactLogger
    {
            public static void Log(string assetId, string name, string type, string path, string version, string environment, string notes)
    {
        // Resolve artifact index path to project root when running from repo root,
        // or fall back to assembly directory if the root can't be determined.
        string indexPath;
        var candidateFromCWD = System.IO.Path.Combine(System.Environment.CurrentDirectory, "artifact_index.json");
        if (System.IO.File.Exists(candidateFromCWD))
        {
            indexPath = candidateFromCWD;
        }
        else
        {
            var assemblyDir = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            var fallback = System.IO.Path.GetFullPath(System.IO.Path.Combine(assemblyDir ?? ".", "..", "..", "..", "artifact_index.json"));
            indexPath = fallback;
        }

        AssetIndexRoot root;
        if (System.IO.File.Exists(indexPath))
        {
            try
            {
                var json = System.IO.File.ReadAllText(indexPath);
                root = System.Text.Json.JsonSerializer.Deserialize<AssetIndexRoot>(json);
                if (root == null) root = new AssetIndexRoot();
            }
            catch
            {
                root = new AssetIndexRoot();
            }
        }
        else
        {
            root = new AssetIndexRoot();
        }

        var entry = new AssetEntry
        {
            AssetId = assetId,
            Name = name,
            Type = type,
            Path = path,
            Version = version,
            Environment = environment,
            Timestamp = DateTime.UtcNow.ToString("o"),
            Notes = notes,
            Dependencies = new List<string> { "Eto.Forms", "Eto.Platform" },
            ShadowDeployment = new ShadowDeployment
            {
                RuntimeType = "container",
                SandboxPolicy = "isolated",
                Os = new[] { "windows", "macos" }
            }
        };

        root.Assets.Add(entry);
        root.GeneratedAt = DateTime.UtcNow.ToString("o");
        var options = new System.Text.Json.JsonSerializerOptions { WriteIndented = true };
        System.IO.File.WriteAllText(indexPath, System.Text.Json.JsonSerializer.Serialize(root, options));
    }
    }
}
