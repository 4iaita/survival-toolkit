/* ---------- Armor stand props the updated pack added ---------- */
// More PROP_GROUPS items (see prop-data.js): the items that turn into props in the newer version of the pack, each added
// to the group it fits, and the wool stairs, which are tents, as a group of their own.
const addProps = (group, items) => PROP_GROUPS.find(g => g.n === group).items.push(...items);
addProps("Around the house", [
  { k: "bamboo", n: "Bamboo", what: "A bamboo plant in a wooden planter." }, { k: "rose_bush", n: "Rose Bush", what: "A rose bush in a clay planter." },
  { k: "banner", n: "Banner", what: "A flag, if the stand also wears dyed leather boots. Each dye gives a different one." }, { k: "beehive", n: "Beehive", what: "A wooden beehive with a shingled roof." },
  { k: "orange_candle", n: "Orange Candle", what: "A golden candelabra with three white candles." }, { k: "spyglass", n: "Spyglass", what: "A telescope on a tripod. Punch the stand to spin it round." },
  { k: "leather", n: "Leather", what: "A hide hung up to dry." }, { k: "web", n: "Cobweb", what: "A basketball hoop, a soccer goal or a volleyball net." },
  { k: "copper_bulb", n: "Copper Bulb", what: "A copper scoreboard that shows a number. The number glows." }, { k: "copper_lantern", n: "Copper Lantern", what: "A copper spotlight sweeping its beam round, warm white or in every color of the rainbow." },
]);
addProps("Outdoors", [
  { k: "fishing_rod", n: "Fishing Rod", what: "A crane with a hook." }, { k: "pale_oak_trapdoor", n: "Pale Oak Trapdoor", what: "A windmill." },
  { k: "spruce_trapdoor", n: "Spruce Trapdoor", what: "A wooden water wheel." }, { k: "spruce_boat", n: "Spruce Boat", what: "A wooden wheelbarrow." },
  { k: "spruce_fence", n: "Spruce Fence", what: "A fence section on stone feet." }, { k: "stick", n: "Stick", what: "A log." },
  { k: "target", n: "Target", what: "A crate with bullseyes on it." }, { k: "glow_frame", n: "Glow Item Frame", what: "A tiny ladder and a small block." },
]);
PROP_GROUPS.push({
  n: "Tents", what: "Wool stairs turn into a camping tent in their color.",
  items: ["White", "Light Gray", "Gray", "Black", "Brown", "Red", "Orange", "Yellow", "Lime", "Green", "Cyan", "Light Blue", "Blue", "Purple", "Magenta", "Pink"]
    .map(c => ({ k: `${c.toLowerCase().replace(" ", "_")}_wool_stairs`, n: `${c} Wool Stairs`, what: `A ${c.toLowerCase()} tent.` })),
});
