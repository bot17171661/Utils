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

Block.registerPlaceFunction("XPStorage", function (coords, item, block, _player, blockSource) {
    if(!World.canTileBeReplaced(block.id, block.data)){
		var relBlock = blockSource.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
		if (World.canTileBeReplaced(relBlock.id, relBlock.data)){
			coords = coords.relative;
		} else return;
	}
    var player = new PlayerActor(_player);
    player.setInventorySlot(player.getSelectedSlot(), item.id, item.count - 1, item.data, item.extra);
    blockSource.setBlock(coords.x, coords.y, coords.z, item.id, item.data);
    var tile = World.addTileEntity(coords.x, coords.y, coords.z, blockSource);
    if (item.extra && item.extra.getInt('xp') && tile.data) {
        tile.data.XP = item.extra.getInt('xp');
    };
});

Block.registerDropFunction("XPStorage", function (coords, id, data, diggingLevel, toolLevel, player, _blockSource) {
    var drop = [];
	var tile = World.getTileEntity(coords.x, coords.y, coords.z, _blockSource);
	if(tile){
        var extra = new ItemExtraData();
        extra.putInt('xp', tile.data.XP);
        drop.push([BlockID['XPStorage'], 1, 0, extra]);
    }
    return drop;
});

var XPStorage_elements = {};
function InitXPStorage_elements() {
    var xpStorageButtonSettings = {
        x1 : 375,//525
        x2 : 625,//775
        y: 110/575.5*UI.getScreenHeight(),
        scale : 3,
        padding: 5
    }
    xpStorageButtonSettings.x1 -= xpStorageButtonSettings.scale*20;
    XPStorage_elements["text"] = {
        type: "text",
        x: 1000/2,
        y: xpStorageButtonSettings.y + 20*xpStorageButtonSettings.scale + 20*xpStorageButtonSettings.scale/2,
        z: 10,
        text: "0",
        font: {
            color: android.graphics.Color.rgb(127, 255, 0),
            shadow: 0.5,
            size: 30
        }
    }
    XPStorage_elements["text"].y -= XPStorage_elements["text"].font.size/2;
    XPStorage_elements["playerxp"] = {
        type: "text",
        x: 1000/2,
        y: 0,
        z: 10,
        text: "0",
        font: {
            color: android.graphics.Color.rgb(127, 255, 0),
            shadow: 0.5,
            size: 20
        }
    }
    XPStorage_elements["playerxp"].y = UI.getScreenHeight() - XPStorage_elements["playerxp"].font.size - 20 - 80;
    XPStorage_elements["xpall"] = {
        type: "button",
        x: xpStorageButtonSettings.x1,
        y: xpStorageButtonSettings.y,
        bitmap: "RS_empty_button",
        bitmap2: 'RS_empty_button_pressed',
        scale: xpStorageButtonSettings.scale,
        clicker: {
            onClick: function (itemContainerUiHandler, container, element) {
                container.sendEvent("xpall", {});
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
            onClick: function (itemContainerUiHandler, container, element) {
                container.sendEvent("xp-all", {});
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
            onClick: function (itemContainerUiHandler, container, element) {
                container.sendEvent("xp5", {});
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
            onClick: function (itemContainerUiHandler, container, element) {
                container.sendEvent("xp-5", {});
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
            onClick: function (itemContainerUiHandler, container, element) {
                container.sendEvent("xp1", {});
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
            onClick: function (itemContainerUiHandler, container, element) {
                container.sendEvent("xp-1", {});
            }
        }
    }
    XPStorage_elements["xp_bar"] = {
        type: "scale",
        x: (1000 - 185 * 3.5) / 2,
        y: XPStorage_elements["xp1"].y + XPStorage_elements["xp1"].scale*20 + 30,
        direction: 0,
        bitmap: "xp_scale_full",
        background: "xp_scale",
        value: 0,
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

var elementsMap = guiXPS.getElements();
TileEntity.registerPrototype(BlockID.XPStorage, {
    defaultValues: {
        XP: 0,
        ticks: 0
    },
    useNetworkItemContainer: true,
    click: function (id, count, data, coords, player, extra) {
        if(Entity.getSneaking(Player.get())) return false;
        var client = Network.getClientForPlayer(player);
        if(!client) return true;
        if (this.container.getNetworkEntity().getClients().contains(client)) return true;
        this.container.openFor(client, "main");
        this.updateText();
        return true;
    },
    updateText: function(){
        var xp_data = XPtoLVL(this.data.XP);
        this.container.setText('text', "" + xp_data.lvl);
        var next_xp = LVLtoXP(xp_data.lvl + 1);
        var this_xp = LVLtoXP(xp_data.lvl);
        var other_xp_data = {
            xp: this.data.XP - this_xp,
            next_xp: next_xp - this_xp
        }
        this.container.setScale('xp_bar', other_xp_data.xp/other_xp_data.next_xp);
        this.container.sendChanges();
    },
    getScreenByName: function(screenName) {
        if(screenName == 'main')return guiXPS;
    },
    tick: function(){
        this.data.ticks++
        if (this.data.ticks < 5) return;
        this.data.ticks = 0;
        var needUpdate = false;
        var startCoords = {x:this.x+0.5,y:this.y+0.5,z:this.z+0.5};
        var ents = Entity.getAllInRange(startCoords, 10, 69);
        for (var i in ents) {
            var ent = ents[i];
            if (!ent) continue;
            var tag = Entity.getCompoundTag(ent);
            var exp_value = tag.getInt('experience value');
            if(exp_value > 0){
                this.data.XP += exp_value;
                needUpdate = true;
            }
            Entity.remove(ent);
        }
        if(needUpdate)this.updateText();
    },
    client:{

    },
    containerEvents: {
        'xp-1': function(eventData, connectedClient) {
            if (this.data.XP == 0) return;
            var player = new PlayerActor(connectedClient.getPlayerUid());
            var xp = Math.min(this.data.XP, LVLtoXP(player.getLevel() + 1) - player.getExperience() + 1);
            this.data.XP -= xp;
            player.addExperience(xp);
            //Game.tipMessage(Native.Color.GREEN + '+1 lvl');
            this.updateText();
        },
        'xp1': function(eventData, connectedClient) {
            var player = new PlayerActor(connectedClient.getPlayerUid());
            var player_lvl = player.getLevel();
            if (player_lvl == 0) return;
            var xp = player.getExperience();
            player.setLevel(player_lvl - 1);
            this.data.XP += xp - player.getExperience();
            //Game.tipMessage(Native.Color.RED + '-1 lvl');
            this.updateText();
        },
        'xp-5': function(eventData, connectedClient) {
            if (this.data.XP == 0) return;
            var player = new PlayerActor(connectedClient.getPlayerUid());
            var xp = Math.min(this.data.XP, LVLtoXP(player.getLevel() + 5) - player.getExperience() + 1);
            this.data.XP -= xp;
            player.addExperience(xp);
            //Game.tipMessage(Native.Color.GREEN + '+5 lvl');
            this.updateText();
        },
        'xp5': function(eventData, connectedClient) {
            var player = new PlayerActor(connectedClient.getPlayerUid());
            var player_lvl = player.getLevel();
            if (player_lvl == 0) return;
            var xp = player.getExperience();
            var setLvl = Math.min(player_lvl, 5);
            player.setLevel(player_lvl - setLvl);
            this.data.XP += xp - player.getExperience();
            //Game.tipMessage(Native.Color.RED + '-5 lvl');
            this.updateText();
        },
        'xpall': function(eventData, connectedClient) {
            var player = new PlayerActor(connectedClient.getPlayerUid());
            this.data.XP += player.getExperience();
            //Game.tipMessage(Native.Color.RED + '-' + Player.getLevel() + ' lvl');
            player.setLevel(0);
            player.setExperience(0);
            this.updateText();
        },
        'xp-all': function(eventData, connectedClient) {
            var player = new PlayerActor(connectedClient.getPlayerUid());
            player.addExperience(this.data.XP);
            //Game.tipMessage(Native.Color.GREEN + '+' + tile.data.XP + ' lvl');
            this.data.XP = 0;
            this.updateText();
        }
    }
});

var _getTextWidth1 = function(){};
(function(){
    var _font = new JavaFONT(XPStorage_elements['text'].font);
    var drawScale = guiXPS.getWindow('main').location.getDrawingScale();
    _getTextWidth1 = function(text){
        return _font.getBounds(text, XPStorage_elements['text'].x * drawScale, XPStorage_elements['text'].y * drawScale, parseFloat(1.0)).width()
    }
})();

var _getTextWidth2 = function(){};
(function(){
    var _font = new JavaFONT(XPStorage_elements['playerxp'].font);
    var drawScale = guiXPS.getWindow('main').location.getDrawingScale();
    _getTextWidth2 = function(text){
        return _font.getBounds(text, XPStorage_elements['playerxp'].x * drawScale, XPStorage_elements['playerxp'].y * drawScale, parseFloat(1.0)).width()
    }
})();

Callback.addCallback('LocalTick', function(){
    if (guiXPS.isOpened()) {
        elementsMap.get('playerxp').setBinding('text', "" + Player.getLevel());
        var elementText1 = elementsMap.get('text');
        elementText1.setPosition(500 - _getTextWidth1(elementText1.getBinding('text'))/2, XPStorage_elements['text'].y);
        var elementText2 = elementsMap.get('playerxp');
        elementText2.setPosition(500 - _getTextWidth2(elementText2.getBinding('text'))/2, XPStorage_elements['playerxp'].y);
    }
});

ModAPI.addAPICallback("WailaAPI", function (api) {
    api.Waila.addExtension(BlockID.XPStorage, function (id, data, elements, tile, yPos) {
        if(!tile)return yPos;
        elements["XPs"] = {
            type: "text",
            text: "XP: " + tile.data.XP,
            x: 200,
            y: yPos,
            font: { color: api.Style.DEF, size: 40 }
        };
        yPos += 60;
        elements["LVLs"] = {
            type: "text",
            text: "LVLs: " + XPtoLVL(tile.data.XP).lvl,
            x: 200,
            y: yPos,
            font: { color: api.Style.DEF, size: 40 }
        };
        yPos += 60;

        api.Waila.requireHeight(40);
        return yPos;
    })
})