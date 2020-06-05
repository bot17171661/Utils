IDRegistry.genBlockID("XPStorage");

Block.createBlock("XPStorage", [
    {
        name: "XP Storage",
        texture: [
            ["XPStorage", 0]
        ],
        inCreative: true
    }
], 'opaque');
Block.setTempDestroyTime(BlockID.XPStorage, 3);
mod_tip(BlockID.XPStorage);

Recipes.addShaped({ id: BlockID.XPStorage, count: 1, data: 0 }, [
    "ibi",
    "b#b",
    "ibi"
], ['b', 42, 0, 'g', 266, 0, 'i', 265, 0]);

var guiXPS = new UI.StandartWindow({
    standart: {
        header: {
            text: {
                text: "XP Storage"
            }
        },
        inventory: {
            standart: true
        },
        background: {
            standart: true
        }
    },

    drawing: [],

    elements: {
        "text": {
            type: "text",
            x: 650,
            y: 172,
            width: 300,
            height: 30,
            text: "0"
        },
        "xp5": {
            type: "button",
            x: 550,
            y: 172,
            bitmap: "Button_xpstorage_xp5",
            scale: 2.5,
            clicker: {
                onClick: function (container, tile) {
                    var content = container.getGuiContent();
                    if (Player.getLevel() < 5) return;
                    Player.setLevel(+Player.getLevel() - 5);
                    tile.data.XP += 5;
                    Game.tipMessage(Native.Color.RED + '-5 lvl');
                }
            }
        },
        "xp-5": {
            type: "button",
            x: 750,
            y: 172,
            bitmap: "Button_xpstorage_xp-5",
            scale: 2.5,
            clicker: {
                onClick: function (container, tile) {
                    var content = container.getGuiContent();
                    if (tile.data.XP < 5) return;
                    Player.setLevel(+Player.getLevel() + 5);
                    tile.data.XP -= 5;
                    Game.tipMessage(Native.Color.GREEN + '+5 lvl');
                }
            }
        },
        "xpall": {
            type: "button",
            x: 550,
            y: 122,
            bitmap: "Button_xpstorage_xpall",
            scale: 2.5,
            clicker: {
                onClick: function (container, tile) {
                    var content = container.getGuiContent();
                    tile.data.XP += Player.getLevel();
                    Game.tipMessage(Native.Color.RED + '-' + Player.getLevel() + ' lvl');
                    Player.setLevel(0);
                }
            }
        },
        "xp-all": {
            type: "button",
            x: 750,
            y: 122,
            bitmap: "Button_xpstorage_xp-all",
            scale: 2.5,
            clicker: {
                onClick: function (container, tile) {
                    var content = container.getGuiContent();
                    Player.setLevel(Player.getLevel() + tile.data.XP);
                    Game.tipMessage(Native.Color.GREEN + '+' + tile.data.XP + ' lvl');
                    tile.data.XP = 0;
                }
            }
        },
        "xp1": {
            type: "button",
            x: 550,
            y: 222,
            bitmap: "Button_xpstorage_xp1",
            scale: 2.5,
            clicker: {
                onClick: function (container, tile) {
                    var content = container.getGuiContent();
                    if (Player.getLevel() < 1) return;
                    Player.setLevel(Player.getLevel() - 1);
                    tile.data.XP++;
                    Game.tipMessage(Native.Color.RED + '-1 lvl');
                }
            }
        },
        "xp-1": {
            type: "button",
            x: 750,
            y: 222,
            bitmap: "Button_xpstorage_xp-1",
            scale: 2.5,
            clicker: {
                onClick: function (container, tile) {
                    var content = container.getGuiContent();
                    if (tile.data.XP < 1) return;
                    Player.setLevel(Player.getLevel() + 1);
                    tile.data.XP--;
                    Game.tipMessage(Native.Color.GREEN + '+1 lvl');
                }
            }
        }
    }
});

TileEntity.registerPrototype(BlockID.XPStorage, {
    defaultValues: {
        XP: 0
    },
    getGuiScreen: function () {
        return guiXPS;
    },
    tick: function () {
        var content = this.container.getGuiContent();
        if (content) {
            content.elements.text.text = "" + this.data.XP;
        }
    }
});

ModAPI.addAPICallback("WailaAPI", function (api) {
    api.Waila.addExtension(BlockID.XPStorage, function (id, data, elements, tile, yPos) {
        elements["LVLs"] = {
            type: "text",
            text: "LVLs: " + tile.data.XP,
            x: 200,
            y: yPos,
            font: { color: api.Style.DEF, size: 40 }
        };
        yPos += 60;

        api.Waila.requireHeight(20);
        return yPos;
    })
})

Callback.addCallback('LevelLoaded', function(){
    var mas = [];
    for(var i = 0; i < 100;i++){

    }
    Player.getExperience();
    Player.setLevel()
})