"""Give the snow golem the updated Actions & Stuff pack's models and animations (see import_port.py).

    python3 import_snow_golem.py path/to/unpacked/pack path/to/textures [--write]

Its plain and Snowman looks get the pack's current models (they went by the old pack's bones; the baby's had the new
model but nothing moved it). It has no kinds. Sheared, it loses its pumpkin (MOB_WOOL in src/mob-data.js: the pack
hides it for q.is_sheared), and the Snowman names take it off too. Run import_additions.py first.
"""
from import_port import port

# It wobbles where it stands, squashing a little, its body rocking and its head bobbing, its eyes and the coals down its
# front jiggling (the pack's idle). The pack's look_at_target only turns its head and eyes towards what it looks at, which
# the stage has none of, so it's left out; so are its move (weighted by how fast it moves) and its sinking into snow
# (only on a snow block).
MOTIONS = [("idle", 1)]

# Standing still for a second and then up to 3 more (the pack's idle controller), it does one of its four idles: lifts
# its pumpkin with both hands to look out from under it; turns to look round, its arms out; reaches up with both arms
# and stretches; or makes a snowball, shows it off and puts it away (the pack shows the snowball, the kfgo bones, while
# it does: hyopyb sets v.fbxfwr). Each blends in over the controller's 0.24 seconds, over its wobbling (keep).
IDLE = lambda key, show=(): {"every": [1, 4], "keep": True, "ease": 0.24, "parts": [(key, 0, None, list(show))]}
SNOWBALL = [["kfgo", True], ["kfgo32dd", True], ["kfgo962jl", True]]
PUMPKIN_LIFT = IDLE("ciducd")
ACTS = [PUMPKIN_LIFT, IDLE("tculwn"), IDLE("qofebb"), IDLE("hyopyb", SNOWBALL)]

# Sheared, it has no pumpkin to lift: the pack picks from the other three. The stage plays this set while it's sheared
# (MOB_WOOL's shornPlays).
SHEARED = {"motions": MOTIONS, "acts": ACTS[1:]}

if __name__ == "__main__":
    port("snow_golem", variants=[""], acts=ACTS, motions=MOTIONS, remodel=["Snowman"], nested_poses=True,
         sets={"sheared": SHEARED})
