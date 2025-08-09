#!/usr/bin/env python3
import sys, os, shutil

def main(in_path, out_path):
    if not os.path.exists(in_path):
        print("ERROR: input not found:", in_path)
        return 1
    
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    try:
        shutil.copy2(in_path, out_path)
        print("Shadow compute (no-op): copied input to output")
        return 0
    except Exception as e:
        print("ERROR:", e)
        return 2

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: gh_shadow_compute.py <input.obj> <output.obj>")
        sys.exit(3)
    sys.exit(main(sys.argv[1], sys.argv[2]))
