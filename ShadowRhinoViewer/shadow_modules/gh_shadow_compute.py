import sys
import shutil

def main(input_path, output_path):
    # Placeholder compute: copy input OBJ to output OBJ
    # Replace with real topology/compute logic as needed.
    shutil.copyfile(input_path, output_path)
    print("Shadow compute complete")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: gh_shadow_compute.py <in_obj> <out_obj>")
        sys.exit(2)
    main(sys.argv[1], sys.argv[2])
    sys.exit(0)
