IDRegistry.genBlockID("XPFarm_core");
Block.createBlock("XPFarm_core", [{
    name: "XP Reactor Core",
    texture: [
        ["XPFarm_core", 0]
    ],
    inCreative: false
}], Block.createSpecialType({
    base: 49,
    destroytime: -1
}));
mod_tip(BlockID.XPFarm_core);

IDRegistry.genBlockID("XPFarm_block");
Block.createBlock("XPFarm_block", [{
    name: "XP Reactor Frame",
    texture: [
        ["XPFarmBlock", 0]
    ],
    inCreative: false
}], Block.createSpecialType({
    base: 49
}));
mod_tip(BlockID.XPFarm_block);

Block.registerDropFunctionForID(BlockID.XPFarm_core, function(coords, id, data, diggingLevel, toolLevel) {
    return [];
});

Block.registerDropFunctionForID(BlockID.XPFarm_block, function(coords, id, data, diggingLevel, toolLevel) {
    return [];
});

TileEntity.registerPrototype(BlockID.XPFarm_core, {
    defaultValues: {
        XP: 0,
        ticks: 0,
        tiicks: 0
    },
    tick: function() {
        if (!this.data) return;
        this.data.ticks++
        if (this.data.ticks >= 1200) {
            this.data.ticks = 0;
            this.data.XP += 30;
        }
        this.data.tiicks++
        if (this.data.tiicks >= 30) {
            this.data.tiicks = 0;
            for (var i in newSides) {
                var coords = {
                    x: this.x + newSides[i][0],
                    y: this.y + newSides[i][1],
                    z: this.z + newSides[i][2]
                }
                if (this.blockSource.isChunkLoadedAt(coords.x, coords.z) && this.blockSource.getBlock(coords.x, coords.y, coords.z).id != BlockID.XPFarm_block) {
                    this.blockSource.explode(this.x, this.y, this.z, 10, true);
                    return;
                }
            }
        }
    }
});

TileEntity.registerPrototype(BlockID.XPFarm_block, {
    defaultValues: {
        XPFarmCore: null,
        ticks: 0
    },
    tick: function() {
        this.data.ticks++;
        if (this.data.ticks >= 30) {
            this.data.ticks = 0;
            if (!this.data.XPFarmCore) {
                this.data.XPFarmCore = checkBlocksOnSides(this, BlockID.XPFarm_core);
                return;
            };
        }
    },
    click: function(id, count, data, coords, player, extra) {
        if (Entity.getSneaking(player) || !this.data.XPFarmCore) return false;
		var client = Network.getClientForPlayer(player);
        var _playerActor = new PlayerActor(player);
        var XPFarmCore = this.data.XPFarmCore;
        if(!XPFarmCore) return true;
        var tile = World.getTileEntity(XPFarmCore.x, XPFarmCore.y, XPFarmCore.z, this.blockSource);
        if (tile.data.XP == 0) return tipMessage(client,"§cExperience not available");
        _playerActor.addExperience(tile.data.XP);
        tipMessage(client, "§a" + tile.data.XP + " XP added");
        tile.data.XP = 0;
        return true;
    }
});

Callback.addCallback("ItemUse", function(coords, item, block, param1, player) {
    if (item.id != ItemID.utilsHammer) return;
    if (block.id != BlockID.worldClock && block.id != BlockID.XPStorage) return;
    var blockSource = BlockSource.getDefaultForActor(player);
    var DBCoords = checkBlocksOnSides(blockSource, coords, 57);
    if (!DBCoords) return;
    var ClocksBlocks = 0;
    var XPClocksCoords = checkBlocksOnSides(blockSource, DBCoords, [BlockID.worldClock, BlockID.XPStorage], true, function(_blockSource, _coords, _block, _list){
        if(_block.id == BlockID.worldClock) ClocksBlocks++;
        return true;
    });
    var client = Network.getClientForPlayer(player);
    if(!client) return;
    if (ClocksBlocks != 3 && XPClocksCoords.length != 6) return chatMessage(client, '§cIncorrect structure, requires 3 XPStorage and 3 WorldClock');
    blockSource.setBlock(DBCoords.x, DBCoords.y, DBCoords.z, BlockID.XPFarm_core, 0);
    for (var i in XPClocksCoords) {
        var crds = XPClocksCoords[i];
        World.removeTileEntity(crds.x, crds.y, crds.z, blockSource);
        blockSource.setBlock(crds.x, crds.y, crds.z, BlockID.XPFarm_block, 0);
        var newTile = World.addTileEntity(crds.x, crds.y, crds.z, blockSource);
        newTile.data.XPFarmCore = DBCoords;
    }
    World.addTileEntity(DBCoords.x, DBCoords.y, DBCoords.z, blockSource);
});

ModAPI.addAPICallback("WailaAPI", function(api) {
    api.Waila.addExtension(BlockID.XPFarm_block, function(id, data, elements, tile, yPos) {
        if (!tile) return yPos;
        if (!tile.data.XPFarmCore) return yPos;
        var coords = tile.data.XPFarmCore;
        var CoreTile = World.getTileEntity(coords.x, coords.y, coords.z);
        if (!CoreTile) return yPos;

        elements["XP"] = {
            type: "text",
            text: "XP: " + CoreTile.data.XP,
            x: 200,
            y: yPos,
            font: {
                color: api.Style.DEF,
                size: 40
            }
        };
        yPos += 60;

        api.Waila.requireHeight(20);
        return yPos;
    })
})