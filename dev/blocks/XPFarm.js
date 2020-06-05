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

var XPFarm = {
    cores: [],
    blocks: []
}
TileEntity.registerPrototype(BlockID.XPFarm_core, {
    defaultValues: {
        XPFarmBlocks: null,
        XP: 0,
        ticks: 0,
        tiicks: 0
    },
    tick: function() {
        if (!this.data) return;
        if (!this.data.XPFarmBlocks) {
            this.data.XPFarmBlocks = [];
            for (var x = this.x - 1; x <= this.x + 1; x++) {
                if (x == this.x) continue;
                this.data.XPFarmBlocks.push({
                    x: x,
                    y: this.y,
                    z: this.z
                })
            }
            for (var y = this.y - 1; y <= this.y + 1; y++) {
                if (y == this.y) continue;
                this.data.XPFarmBlocks.push({
                    x: this.x,
                    y: y,
                    z: this.z
                })
            }
            for (var z = this.z - 1; z <= this.z + 1; z++) {
                if (z == this.z) continue;
                this.data.XPFarmBlocks.push({
                    x: this.x,
                    y: this.y,
                    z: z
                })
            }
            return;
        }
        this.data.ticks++
        if (this.data.ticks >= 1200) {
            this.data.ticks = 0;
            this.data.XP += 30;
        }
        this.data.tiicks++
        if (this.data.tiicks >= 40) {
            this.data.tiicks = 0;
            for (var i in this.data.XPFarmBlocks) {
                var coords = this.data.XPFarmBlocks[i];
                if (World.getBlock(coords.x, coords.y, coords.z).id != BlockID.XPFarm_block) {
                    for (var i in this.data.XPFarmBlocks) {
                        var coords = this.data.XPFarmBlocks[i];
                        World.removeTileEntity(coords.x, coords.y, coords.z);
                    }
                    World.removeTileEntity(this.x, this.y, this.z);
                    World.explode(this.x, this.y, this.z, 10, true);
                    return;
                }
            }
        }
    },
    init: function() {
        XPFarm.cores.push({
            x: this.x,
            y: this.y,
            z: this.z
        });
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
                var coords = {
                    x: this.x,
                    y: this.y,
                    z: this.z
                };
                this.data.XPFarmCore = searchXPFarmCore(coords);
                return;
            };
        }
    },
    click: function(id, count, data, coords) {
        if (!this.data.XPFarmCore) return;
        var XPFarmCore = this.data.XPFarmCore;
        var tile = World.getTileEntity(XPFarmCore.x, XPFarmCore.y, XPFarmCore.z);
        if (tile.data.XP == 0) return Game.tipMessage("§cExperience not available");
        Player.addExperience(tile.data.XP);
        Game.tipMessage("§a" + tile.data.XP + " XP added");
        tile.data.XP = 0;
    },
    init: function() {
        XPFarm.blocks.push({
            x: this.x,
            y: this.y,
            z: this.z
        });
    }
});

function searchXPFarmCore(coords) {
    for (var x = coords.x - 1; x <= coords.x + 1; x++) {
        if (x == coords.x) continue;
        if (World.getBlock(x, coords.y, coords.z).id == BlockID.XPFarm_core) {
            return {
                x: x,
                y: coords.y,
                z: coords.z
            }
        }
    }
    for (var y = coords.y - 1; y <= coords.y + 1; y++) {
        if (y == coords.y) continue;
        if (World.getBlock(coords.x, y, coords.z).id == BlockID.XPFarm_core) {
            return {
                x: coords.x,
                y: y,
                z: coords.z
            }
        }
    }
    for (var z = coords.z - 1; z <= coords.z + 1; z++) {
        if (z == coords.z) continue;
        if (World.getBlock(coords.x, coords.y, z).id == BlockID.XPFarm_core) {
            return {
                x: coords.x,
                y: coords.y,
                z: z
            }
        }
    }
}

function searchDiamondBlock(coords) {
    //var x = coords.x,y = coords.y, z = coords.z;
    for (var x = coords.x - 1; x <= coords.x + 1; x++) {
        if (x == coords.x) continue;
        if (World.getBlock(x, coords.y, coords.z).id == 57) {
            return {
                x: x,
                y: coords.y,
                z: coords.z
            }
        }
    }
    for (var y = coords.y - 1; y <= coords.y + 1; y++) {
        if (y == coords.y) continue;
        if (World.getBlock(coords.x, y, coords.z).id == 57) {
            return {
                x: coords.x,
                y: y,
                z: coords.z
            }
        }
    }
    for (var z = coords.z - 1; z <= coords.z + 1; z++) {
        if (z == coords.z) continue;
        if (World.getBlock(coords.x, coords.y, z).id == 57) {
            return {
                x: coords.x,
                y: coords.y,
                z: z
            }
        }
    }
}

function searchXPandClockBlocks(coords) {
    var XPStorages = [];
    var WorldClocks = [];
    for (var x = coords.x - 1; x <= coords.x + 1; x++) {
        if (x == coords.x) continue;
        var block = World.getBlock(x, coords.y, coords.z);
        if (block.id == BlockID.worldClock) WorldClocks.push({
            x: x,
            y: coords.y,
            z: coords.z
        });
        if (block.id == BlockID.XPStorage) XPStorages.push({
            x: x,
            y: coords.y,
            z: coords.z
        });
    }
    for (var y = coords.y - 1; y <= coords.y + 1; y++) {
        if (y == coords.y) continue;
        var block = World.getBlock(coords.x, y, coords.z);
        if (block.id == BlockID.worldClock) WorldClocks.push({
            x: coords.x,
            y: y,
            z: coords.z
        });
        if (block.id == BlockID.XPStorage) XPStorages.push({
            x: coords.x,
            y: y,
            z: coords.z
        });
    }
    for (var z = coords.z - 1; z <= coords.z + 1; z++) {
        if (z == coords.z) continue;
        var block = World.getBlock(coords.x, coords.y, z);
        if (block.id == BlockID.worldClock) WorldClocks.push({
            x: coords.x,
            y: coords.y,
            z: z
        });
        if (block.id == BlockID.XPStorage) XPStorages.push({
            x: coords.x,
            y: coords.y,
            z: z
        });
    }
    return {
        allCoords: XPStorages.concat(WorldClocks),
        XPStorages: XPStorages,
        WorldClocks: WorldClocks
    }
}

Callback.addCallback("ItemUse", function(coords, item, block) {
    if (item.id != ItemID.utilsHammer) return;
    if (block.id != BlockID.worldClock && block.id != BlockID.XPStorage) return;
    var DBCoords = searchDiamondBlock(coords);
    if (!DBCoords) return;
    var XPClocksCoords = searchXPandClockBlocks(DBCoords);
    if (!XPClocksCoords) return;
    if (XPClocksCoords.XPStorages.length != 3 || XPClocksCoords.WorldClocks.length != 3) return Game.message('§cIncorrect structure, requires 3 XPStorage and 3 WorldClock');
    XPClocksCoords = XPClocksCoords.allCoords;
    World.setBlock(DBCoords.x, DBCoords.y, DBCoords.z, BlockID.XPFarm_core, 0);
    for (var i in XPClocksCoords) {
        var crds = XPClocksCoords[i];
        World.removeTileEntity(crds.x, crds.y, crds.z);
        World.setBlock(crds.x, crds.y, crds.z, BlockID.XPFarm_block, 0);
        World.addTileEntity(crds.x, crds.y, crds.z).data.XPFarmCore = DBCoords;
    }
    World.addTileEntity(DBCoords.x, DBCoords.y, DBCoords.z).data.XPFarmBlocks = XPClocksCoords;
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