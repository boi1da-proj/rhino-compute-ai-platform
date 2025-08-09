def run(inputs: dict) -> dict:
    points = inputs.get("points", [])
    if not points:
        return {"bbox": None}
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    zs = [p[2] for p in points]
    bbox = {
        "min": [min(xs), min(ys), min(zs)],
        "max": [max(xs), max(ys), max(zs)],
    }
    return {"bbox": bbox}
