#!/usr/bin/env python3
# audit_architecture.py - Health check for Soft.Geometry architecture

import os
import json
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

def check_path(path, description):
    exists = os.path.exists(path)
    print(f"✓ {description}: {'OK' if exists else 'MISSING'}")
    return exists

def check_github_repo(repo_path):
    try:
        result = subprocess.run(['git', 'remote', '-v'], 
                              cwd=repo_path, capture_output=True, text=True)
        has_remote = 'origin' in result.stdout
        print(f"✓ GitHub repo remote: {'OK' if has_remote else 'MISSING'}")
        return has_remote
    except:
        print("✓ GitHub repo remote: ERROR")
        return False

def check_api_endpoint(url):
    try:
        urllib.request.urlopen(url, timeout=5)
        print(f"✓ API endpoint {url}: OK")
        return True
    except urllib.error.URLError:
        print(f"✓ API endpoint {url}: UNREACHABLE")
        return False

def check_artifact_index(index_path):
    try:
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                data = json.load(f)
            has_deployments = 'shadow_deployments' in data
            print(f"✓ Artifact index schema: {'OK' if has_deployments else 'INVALID'}")
            return has_deployments
        else:
            print("✓ Artifact index: MISSING")
            return False
    except:
        print("✓ Artifact index: ERROR")
        return False

def main():
    print("🔍 Soft.Geometry Architecture Audit")
    print("=" * 50)
    
    # Check local paths
    project_root = Path("/Users/petersancho/soft")
    soft_geometry = project_root / "Soft.Geometry"
    shadow_root = project_root / "ShadowRhinoViewer"
    
    checks = []
    
    # Frontend checks
    checks.append(check_path(soft_geometry, "Soft.Geometry directory"))
    if soft_geometry.exists():
        checks.append(check_path(soft_geometry / "src/App.js", "Frontend App.js"))
        checks.append(check_path(soft_geometry / "src/components/GeometryViewer.js", "GeometryViewer component"))
        checks.append(check_github_repo(soft_geometry))
    
    # Backend/VM checks
    checks.append(check_path(shadow_root / "shadow_modules/gh_shadow_compute.py", "Shadow compute module"))
    checks.append(check_path(shadow_root / "artifact_index.json", "Artifact index"))
    checks.append(check_path(shadow_root / "config/shadow_config.json", "Shadow config"))
    checks.append(check_artifact_index(shadow_root / "artifact_index.json"))
    
    # API endpoint check
    checks.append(check_api_endpoint("http://4.206.116.20/grasshopper"))
    
    # Summary
    print("\n" + "=" * 50)
    passed = sum(checks)
    total = len(checks)
    print(f"📊 Audit Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("✅ Architecture is healthy!")
    else:
        print("⚠️  Some issues detected. Review failed checks above.")

if __name__ == "__main__":
    main()
