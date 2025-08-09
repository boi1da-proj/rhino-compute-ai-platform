# GhPython component example (Inputs: P (List[Rhino.Geometry.Point3d]), Density (float); Output: Result)
import os, json, time, sys
import Rhino
import System

class ShadowRuntime(object):
    def __init__(self, config_path):
        self.config_path = config_path
    def run_shadow_module(self, module_name, inputs):
        bbox = Rhino.Geometry.BoundingBox(inputs["points"])
        return {
            "bbox": [bbox.Min.X, bbox.Min.Y, bbox.Min.Z, bbox.Max.X, bbox.Max.Y, bbox.Max.Z],
            "density": inputs.get("density", None)
        }

root = System.IO.Path.GetFullPath(os.getcwd())
shadow_config_path = System.IO.Path.Combine(root, "shadow_config.json")
artifact_runs_path = System.IO.Path.Combine(root, "artifact_runs.json")

rt = ShadowRuntime(shadow_config_path)
mod = "softlyplease.compute_aabb"
inputs_payload = {"points": P, "density": Density}
res = rt.run_shadow_module(mod, inputs_payload)

entry = {
    "module": mod,
    "timestamp": time.time(),
    "environment": "dev",
    "platform": sys.platform,
    "status": "ok",
    "result_summary": {"bbox": res["bbox"]}
}
try:
    with open(artifact_runs_path, "a") as f:
        f.write(json.dumps(entry) + "\n")
except Exception:
    pass

Result = "Shadow run complete."
