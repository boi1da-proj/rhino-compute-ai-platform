# GhPython runner for topopt.gh (Rhino 8)
# Inputs (in GH): G (Brep), ProjectRoot (Text)
# Output: OptimizedGeometry (Mesh)
import Rhino.Geometry as RG
import System
import os, io, json, hashlib, datetime

def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def export_mesh_to_obj(mesh, path):
    with io.open(path, 'w', encoding='utf-8') as f:
        for v in mesh.Vertices:
            f.write(u"v {0} {1} {2}\n".format(v.X, v.Y, v.Z))
        for i in range(mesh.Faces.Count):
            face = mesh.Faces[i]
            if face.IsQuad:
                a, b, c, d = face.A, face.B, face.C, face.D
                f.write(u"f {0} {1} {2} {3}\n".format(a+1, b+1, c+1, d+1))
            else:
                a, b, c = face.A, face.B, face.C
                f.write(u"f {0} {1} {2}\n".format(a+1, b+1, c+1))

def obj_to_mesh(path):
    verts, faces = [], []
    with io.open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('v '):
                _, x, y, z = line.strip().split()
                verts.append((float(x), float(y), float(z)))
            elif line.startswith('f '):
                parts = line.strip().split()[1:]
                idxs = [int(p.split('/')[0]) - 1 for p in parts]
                if len(idxs) >= 3:
                    faces.append((idxs[0], idxs[1], idxs[2]))
                    if len(idxs) == 4:
                        faces.append((idxs[0], idxs[2], idxs[3]))
    m = RG.Mesh()
    for v in verts: m.Vertices.Add(v[0], v[1], v[2])
    for ftri in faces: m.Faces.AddFace(ftri[0], ftri[1], ftri[2])
    m.Normals.ComputeNormals(); m.Compact()
    return m

# The following function expects to be pasted into GhPython and provided with
# the GH inputs G (Brep), ProjectRoot (Text). It relies on config/shadow_config.json
# and shadow_modules/gh_shadow_compute.py which are versioned in this repo.

def run_ghpython(G, ProjectRoot):
    CFG_PATH = os.path.join(ProjectRoot, 'config', 'shadow_config.json')
    cfg = json.load(open(CFG_PATH, 'r'))
    MODULE_PATH = os.path.normpath(os.path.join(ProjectRoot, cfg.get('shadow_module_path','shadow_modules/gh_shadow_compute.py')))
    INDEX_PATH  = os.path.normpath(os.path.join(ProjectRoot, cfg.get('artifact_index_path','artifact_index.json')))
    RUNTIME_DIR = os.path.join(ProjectRoot, 'shadow_runtime')
    if not os.path.isdir(RUNTIME_DIR): os.makedirs(RUNTIME_DIR)
    IN_OBJ  = os.path.join(RUNTIME_DIR, 'shadow_input.obj')
    OUT_OBJ = os.path.join(RUNTIME_DIR, 'shadow_output.obj')

    meshes = RG.Mesh.CreateFromBrep(G, RG.MeshingParameters.Default)
    if not meshes: return None
    mesh_in = meshes[0]
    export_mesh_to_obj(mesh_in, IN_OBJ)

    psi = System.Diagnostics.ProcessStartInfo()
    psi.FileName = 'python'
    psi.Arguments = '"{0}" "{1}" "{2}"'.format(MODULE_PATH, IN_OBJ, OUT_OBJ)
    psi.UseShellExecute = False
    psi.RedirectStandardOutput = True
    psi.RedirectStandardError = True
    p = System.Diagnostics.Process.Start(psi)
    stdout = p.StandardOutput.ReadToEnd(); stderr = p.StandardError.ReadToEnd(); p.WaitForExit(); rc = int(p.ExitCode)

    mesh_out = obj_to_mesh(OUT_OBJ) if os.path.isfile(OUT_OBJ) else mesh_in

    run_entry = {
        'run_id': datetime.datetime.utcnow().strftime('run-%Y%m%d-%H%M%S'),
        'asset_id': 'shadow-ghost-001', 'name': 'GH Shadow Compute', 'type': 'shadow_module', 'version': '0.1.0',
        'shadow_runtime': cfg.get('runtime_type','process'), 'sandbox': cfg.get('sandbox_policy','isolated'),
        'os': cfg.get('os','windows'), 'environment': cfg.get('default_environment','dev'),
        'timestamp': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'), 'sha256': sha256_file(MODULE_PATH),
        'status': {'return_code': rc, 'stdout': stdout, 'stderr': stderr}
    }
    if os.path.isfile(INDEX_PATH):
        with open(INDEX_PATH,'r+',encoding='utf-8') as f:
            idx = json.load(f); runs = idx.get('shadow_deployments',[]); runs.append(run_entry); idx['shadow_deployments']=runs
            f.seek(0); json.dump(idx,f,indent=2); f.truncate()
    else:
        idx = {'generated_at': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'), 'version':'0.1.0', 'assets': [], 'shadow_deployments':[run_entry]}
        with open(INDEX_PATH,'w',encoding='utf-8') as f: json.dump(idx,f,indent=2)
    return mesh_out
