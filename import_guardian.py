"""Give the guardian the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_guardian.py path/to/unpacked/pack path/to/textures [--write]

Its looks get the pack's current models (the plain and baby ones went by the old pack's bones). It has no kinds and no
names but its baby's. The stage shows it in the ocean, smaller than the elder guardian (GUARDIAN_ZOOM in src/mob-data.js).
Run import_additions.py first.
"""
from import_port import ia, port, put

# In the water it floats, bobbing, its head and tail swaying (the pack's idle), with its spikes drawn in (the pack's
# neutral, which plays once and holds while it has no target). Its swim plays at half strength standing still, but only
# moves on as it swims, so the stage plays it at the pace it had before, its tail swishing and its body turning a little
# from side to side. Its eye looks at the camera (the pack's look_at_target), which the stage does by itself as it's
# turned (MOB_WATCH in src/mob-data.js).
MOTIONS = [("idle", 1), ("neutral", 1, "held"), ("swim", 0.5, 1.8)]

# The pack gives it no idles: what it does now and then is all with a target. When it has one it pushes its spikes out
# (the pack's has_target), and draws them in again when it loses it (neutral); after a while it ripples them as it fires
# its beam, which the stage leaves out. Every 6 to 12 seconds the stage pushes them out, holds them out for SPIKES_OUT
# seconds and draws them in again, over its floating (keep). The loop already holds them in, so spikes_out() takes that
# held pose off the act's frames: what's left is how far they come out.
SPIKES_OUT = 3
SPIKES = {"every": [6, 12], "keep": True, "parts": [("has_target", 0, None, []), ("neutral", 0, None, [])]}
ACTS = [SPIKES]

# A baby (the pack's, named Baby, Fry or Prismy) moves its spikes three quarters as far, and swims twice as strongly at
# half the pace.
BABY_SPIKES = {**SPIKES, "parts": [(key, start, end, show, 1, 0.75) for key, start, end, show in SPIKES["parts"]]}
BABY = {"motions": [("idle", 1), ("neutral", 0.75, "held"), ("swim", 1, 0.9)], "acts": [BABY_SPIKES]}


def spikes_out(mob):
    """The mob's spike acts (its own and its baby's) as pushes out from the held pose its loops draw them in to: that
    pose taken off every frame, and a part between the two that holds them out."""
    text = ia.MODELS_JS.read_text()
    motions, acts = ia.parse_section(text, "MOB_MOTIONS"), ia.parse_section(text, "MOB_ACTS")
    for key in (mob, f"{mob}:baby"):
        held = next(loop["bones"] for loop in motions[key] if loop["length"] == 1)
        out = []
        for act in acts[key]:
            push, back = act["parts"]
            # Both also jolt its head, squint its eye and flick its tail, settling back to rest by their end: the held
            # pose only has the spikes drawn in (and the rest as it is), so that's all that comes off.
            for part in (push, back):
                for bone, channels in part["bones"].items():
                    for ch, base in held.get(bone, {}).items():
                        if ch in channels:
                            base = base[0]
                            off = (lambda v, b: v / b) if ch == "s" else (lambda v, b: v - b)
                            channels[ch] = [[round(off(v, b), 2) for v, b in zip(f, base)] for f in channels[ch]]
            first = push["to"] - push["from"]
            out_pose = {b: {"p": [c["p"][-1], c["p"][-1]]} for b, c in push["bones"].items() if "p" in c and any(c["p"][-1])}
            hold = {"from": first, "to": first + SPIKES_OUT, "bones": out_pose, "show": []}
            back["from"], back["to"] = hold["to"], round(hold["to"] + back["to"] - back["from"], 4)
            act["parts"] = [push, hold, back]
            act["length"] = back["to"]
            out.append(act)
        text = put(text, "MOB_ACTS", key, out)
    ia.MODELS_JS.write_text(text)


if __name__ == "__main__":
    port("guardian", variants=[""], acts=ACTS, motions=MOTIONS, nested_poses=True, sets={"baby": BABY}, plays={"baby": "baby"})
    if ia.WRITE:
        spikes_out("guardian")
