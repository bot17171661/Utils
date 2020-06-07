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

function XPtoLVL(xp) { // https://minecraft.gamepedia.com/Experience
    var currentLevel = 0;
    var remainingXP = xp;

    while (true) {
        var requiredForNextLevel;
        if (currentLevel <= 16) {
            requiredForNextLevel = (2 * currentLevel) + 7;
        } else if (currentLevel >= 17 && currentLevel <= 31) {
            requiredForNextLevel = (5 * currentLevel) - 38;
        } else {
            requiredForNextLevel = (9 * currentLevel) - 158;
        }

        if (remainingXP >= requiredForNextLevel) {
            remainingXP -= requiredForNextLevel;
            currentLevel++;
        } else break;
    }
   
    return {lvl: currentLevel, rem: remainingXP};
}

function LVLtoXP(lvl) { // https://minecraft.gamepedia.com/Experience
    if (lvl <= 16) {
        requiredXP = Math.pow(lvl,2) + 6 * lvl;
    } else if (lvl >= 17 && lvl <= 31) {
        requiredXP = 2.5 *  Math.pow(lvl, 2) - 40.5 * lvl + 360
    } else {
        requiredXP = 4.5 * Math.pow(lvl, 2) - 162.5 * lvl + 2220
    }
   
    return requiredXP;
}

function InitXPStorage(){
    Block.registerPlaceFunction("XPStorage", function (coords, item, block) {
        coords = World.canTileBeReplaced(block.id, block.data) ? coords : coords.relative;
        World.setBlock(coords.x, coords.y, coords.z, item.id, item.data);
        var tile = World.addTileEntity(coords.x, coords.y, coords.z);
        if (item.extra && item.extra.getInt('xp') && tile.data) {
            tile.data.XP = item.extra.getInt('xp');
        };
    });

    Block.registerDropFunction("XPStorage", function (coords, id, data, diggingLevel, toolLevel) {
        return [];
    });


    var XPStorage_elements = {};
    function InitXPStorage_elements() {
        var xpStorageButtonSettings = {
            x1 : 375,//525
            x2 : 625,//775
            y: 120,
            scale : 3,
            padding: 5
        }
        xpStorageButtonSettings.x1 -= xpStorageButtonSettings.scale*20;
        XPStorage_elements["text"] = {
            type: "text",
            x: 1000/2,
            y: xpStorageButtonSettings.y + 20*xpStorageButtonSettings.scale + 20*xpStorageButtonSettings.scale/2,
            width: 300,
            height: 30,
            text: "0",
            font: {
                color: android.graphics.Color.rgb(127, 255, 0),
                shadow: 0.5,
                size: 30
            }
        }
        XPStorage_elements["text"].y -= XPStorage_elements["text"].font.size/2;
        XPStorage_elements["xpall"] = {
            type: "button",
            x: xpStorageButtonSettings.x1,
            y: xpStorageButtonSettings.y,
            bitmap: "RS_empty_button",
            bitmap2: 'RS_empty_button_pressed',
            scale: xpStorageButtonSettings.scale,
            clicker: {
                onClick: function(container, tile) {
                    var content = container.getGuiContent();
                    tile.data.XP += Player.getExperience();
                    //Game.tipMessage(Native.Color.RED + '-' + Player.getLevel() + ' lvl');
                    Player.setLevel(0);
                    Player.setExperience(0);
                    tile.updateText();
                }
            }
        }
        XPStorage_elements["xp-all"] = {
            type: "button",
            x: xpStorageButtonSettings.x2,
            y: xpStorageButtonSettings.y,
            bitmap: "RS_empty_button",
            bitmap2: 'RS_empty_button_pressed',
            scale: xpStorageButtonSettings.scale,
            clicker: {
                onClick: function(container, tile) {
                    Player.addExperience(tile.data.XP);
                    //Game.tipMessage(Native.Color.GREEN + '+' + tile.data.XP + ' lvl');
                    tile.data.XP = 0;
                    tile.updateText();
                }
            }
        }
        XPStorage_elements["xp5"] = {
            type: "button",
            x: xpStorageButtonSettings.x1,
            y: XPStorage_elements["xpall"].y + XPStorage_elements["xpall"].scale*20 + xpStorageButtonSettings.padding,
            bitmap: "RS_empty_button",
            bitmap2: 'RS_empty_button_pressed',
            scale: xpStorageButtonSettings.scale,
            clicker: {
                onClick: function(container, tile) {
                    if (Player.getLevel() == 0) return;
                    var xp = Player.getExperience();
                    var setLvl = Math.min(Player.getLevel(), 5);
                    Player.setLevel(Player.getLevel() - setLvl);
                    tile.data.XP += xp - Player.getExperience();
                    //Game.tipMessage(Native.Color.RED + '-5 lvl');
                    tile.updateText();
                }
            }
        }
        XPStorage_elements["xp-5"] = {
            type: "button",
            x: xpStorageButtonSettings.x2,
            y: XPStorage_elements["xp-all"].y + XPStorage_elements["xp-all"].scale*20 + xpStorageButtonSettings.padding,
            bitmap: "RS_empty_button",
            bitmap2: 'RS_empty_button_pressed',
            scale: xpStorageButtonSettings.scale,
            clicker: {
                onClick: function(container, tile) {
                    if (tile.data.XP == 0) return;
                    var xp = Math.min(tile.data.XP, (LVLtoXP(Player.getLevel() + 5) - Player.getExperience()));
                    Player.addExperience(xp);
                    tile.data.XP -= xp;
                    //Game.tipMessage(Native.Color.GREEN + '+5 lvl');
                    tile.updateText();
                }
            }
        }
        XPStorage_elements["xp1"] = {
            type: "button",
            x: xpStorageButtonSettings.x1,
            y: XPStorage_elements["xp5"].y + XPStorage_elements["xp5"].scale*20 + xpStorageButtonSettings.padding,
            bitmap: "RS_empty_button",
            bitmap2: 'RS_empty_button_pressed',
            scale: xpStorageButtonSettings.scale,
            clicker: {
                onClick: function(container, tile) {
                    if (Player.getLevel() == 0) return;
                    var xp = Player.getExperience();
                    Player.setLevel(Player.getLevel() - 1);
                    tile.data.XP += xp - Player.getExperience();
                    //Game.tipMessage(Native.Color.RED + '-1 lvl');
                    tile.updateText();
                }
            }
        }
        XPStorage_elements["xp-1"] = {
            type: "button",
            x: xpStorageButtonSettings.x2,
            y: XPStorage_elements["xp-5"].y + XPStorage_elements["xp-5"].scale*20 + xpStorageButtonSettings.padding,
            bitmap: "RS_empty_button",
            bitmap2: 'RS_empty_button_pressed',
            scale: xpStorageButtonSettings.scale,
            clicker: {
                onClick: function(container, tile) {
                    if (tile.data.XP == 0) return;
                    var xp = Math.min(tile.data.XP, (LVLtoXP(Player.getLevel() + 1) - Player.getExperience()));
                    Player.addExperience(xp);
                    tile.data.XP -= xp;
                    //Game.tipMessage(Native.Color.GREEN + '+1 lvl');
                    tile.updateText();
                }
            }
        }
        XPStorage_elements["xp_bar"] = {
            type: "scale",
            x: (1000 - 185 * 3.5) / 2,
            y: XPStorage_elements["xp1"].y + XPStorage_elements["xp1"].scale*20 + 30,
            direction: 0,
            bitmap: "xp_scale_full",
            value: 0,
            scale: 3.5,
        }
        XPStorage_elements["xp_bar_overlay"] = {
            type: "image",
            x: XPStorage_elements["xp_bar"].x,
            y: XPStorage_elements["xp_bar"].y,
            bitmap: "xp_scale",
            scale: 3.5,
        }
        var xp_storage_map = ['all', '5', '1', '-all', '-5', '-1'];
        for(var i = 0; i < 6; i++){
            XPStorage_elements['xp'+xp_storage_map[i]+'_image'] = {
                type: "image",
                x: XPStorage_elements['xp'+xp_storage_map[i]].x,
                y: XPStorage_elements['xp'+xp_storage_map[i]].y,
                z: 10,
                bitmap: "xpstorage"+xp_storage_map[i],
                scale: XPStorage_elements['xp'+xp_storage_map[i]].scale,
            }
        }
    }
    InitXPStorage_elements();

    var guiXPS = new UI.StandartWindow({
        standart: {
            header: {
                text: {
                    text: "XP Storage"
                }
            },
            background: {
                standart: true
            }
        },
    
        drawing: [],
    
        elements: XPStorage_elements
    });

    TileEntity.registerPrototype(BlockID.XPStorage, {
        defaultValues: {
            XP: 0
        },
        getGuiScreen: function () {
            if(Entity.getSneaking(Player.get())) return;
            if (!this.container.isOpened())this.container.openAs(guiXPS);
            this.updateText();
        },
        updateText: function(){
            if (this.container.isOpened()) {
                var content = this.container.getGuiContent();
                var xp_data = XPtoLVL(this.data.XP);
                content.elements.text.text = "" + xp_data.lvl;
                content.elements.text.x = 1000/2 - content.elements.text.text.length*content.elements.text.font.size/2;
                var next_xp = LVLtoXP(xp_data.lvl + 1);
                var this_xp = LVLtoXP(xp_data.lvl);
                var other_xp_data = {
                    xp: this.data.XP - this_xp,
                    next_xp: next_xp - this_xp
                }
                content.elements.xp_bar.value = other_xp_data.xp/other_xp_data.next_xp;
            }
        },
        destroy: function () {
            var extra = new ItemExtraData();
            extra.putInt('xp', this.data.XP);
            World.drop(this.x + 0.5, this.y + 0.5, this.z + 0.5, BlockID['XPStorage'], 1, 0, extra);
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
}
if(InnerCore_pack.packVersionCode >= 65){
    InitXPStorage()
} else {
    alert('Sorry, your InnerCore version is old')
}