IDRegistry.genItemID("concentratedDust");
Item.createItem("concentratedDust", "Concentrated dust", {
    name: "conc_dust"
}, {
    stack: 64
});
mod_tip(ItemID.concentratedDust);

Callback.addCallback("PostLoaded", function () {
    Combiner.addCraft({
        item1: {
            id: 331,
            data: -1
        },
        item2: {
            id: 348,
            data: -1
        },
        result: {
            id: ItemID.concentratedDust,
            data: 0
        }
    })
});