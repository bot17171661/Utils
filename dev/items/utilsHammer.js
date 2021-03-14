IDRegistry.genItemID("utilsHammer");
Item.createItem("utilsHammer", "Hammer", {
    name: "utilsHammer"
}, {
    stack: 1
});
Item.setMaxDamage(ItemID.utilsHammer, 100);
mod_tip(ItemID.utilsHammer);

Recipes.addShaped({ id: ItemID.utilsHammer, count: 1, data: 0 }, [
    " is",
    " si",
    "s  "
], ['s', 280, 0, 'i', 265, 0]);