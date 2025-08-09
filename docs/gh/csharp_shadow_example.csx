// C# Script component (Inputs: P (List<Point3d>), Density (double); Output: Result (string))
#r "nuget: Newtonsoft.Json, 13.0.3"
using System;
using System.IO;
using System.Collections.Generic;
using Rhino.Geometry;
using Newtonsoft.Json;

public class RuntimeEntry {
  public string module; public long timestamp; public string environment;
  public string platform; public string status; public object result_summary;
}

void RunScript(List<Point3d> P, double Density, ref object Result)
{
  var bbox = new BoundingBox(P);
  var res = new { bbox = new double[]{bbox.Min.X,bbox.Min.Y,bbox.Min.Z,bbox.Max.X,bbox.Max.Y,bbox.Max.Z}, density = Density };
  var entry = new RuntimeEntry {
    module = "softlyplease.compute_aabb",
    timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
    environment = "dev",
    platform = Environment.OSVersion.Platform.ToString(),
    status = "ok",
    result_summary = new { bbox = res.bbox }
  };
  try {
    var root = Directory.GetCurrentDirectory();
    var path = Path.Combine(root, "artifact_runs.json");
    File.AppendAllText(path, JsonConvert.SerializeObject(entry) + Environment.NewLine);
  } catch {}
  Result = "Shadow run complete.";
}
