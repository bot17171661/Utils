IDRegistry.genItemID("angelRing");
Item.createItem("angelRing", "Angel ring", {
	name: "angelRing"
}, {
	stack: 1,
	isTech: true
});
mod_tip(ItemID.angelRing);
var baubleEquip = false;
var ringEquiped = false;

var ringVariations = [
	{
		name: 'Invisible Wings',
		texture: 'wings/wing0'
	},
	{
		name: 'Feathery Wings',
		texture: 'wings/wing1'
	},
	{
		name: 'Fairy Wings',
		texture: 'wings/wing2'
	},
	{
		name: 'Dragon Wings',
		texture: 'wings/wing3'
	},
	{
		name: 'Golden Wings',
		texture: 'wings/wing4'
	},
	{
		name: 'Dark Wings',
		texture: 'wings/wing5'
	}
];
var netherStarId = InnerCore_pack.packVersionCode > 108  ? 763 : VanillaItemID.netherstar;
var dyeId5 = InnerCore_pack.packVersionCode > 108 ? 825 : VanillaItemID.dye;
var dyeId9 = InnerCore_pack.packVersionCode > 108 ? 837 : VanillaItemID.dye;
var isrequiredDyeData = dyeId5 == 351;
Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 0
}, [
	"g#g",
	"#s#",
	" # "
], ['s', netherStarId, 0, '#', VanillaItemID.gold_ingot, 0, 'g', 20, 0]);

Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 1
}, [
	"g#g",
	"#s#",
	" # "
], ['s', netherStarId, 0, '#', VanillaItemID.gold_ingot, 0, 'g', 288, 0]);

Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 2
}, [
	"g#c",
	"#s#",
	" # "
], ['s', netherStarId, 0, '#', VanillaItemID.gold_ingot, 0, 'g', dyeId5, isrequiredDyeData ? 5 : 0, 'c', dyeId9, isrequiredDyeData ? 9 : 0]);

Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 3
}, [
	"g#g",
	"#s#",
	" # "
], ['s', netherStarId, 0, '#', VanillaItemID.gold_ingot, 0, 'g', 334, 0]);

Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 4
}, [
	"g#g",
	"#s#",
	" # "
], ['s', netherStarId, 0, '#', VanillaItemID.gold_ingot, 0, 'g', 371, 0]);

Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 5
}, [
	"g#c",
	"#s#",
	" # "
], ['s', netherStarId, 0, '#', VanillaItemID.gold_ingot, 0, 'g', 263, 0, 'c', 263, 1]);

Item.addCreativeGroup("angelRings", Translation.translate("Angel Rings"), [ItemID.angelRing]);

for(var i in ringVariations)Item.addToCreative(ItemID.angelRing, 1, i);

Item.registerNameOverrideFunction(ItemID.angelRing, function(item, name){
	return name + (ringVariations[item.data] ? '\n§7' + Translation.translate(ringVariations[item.data].name) : "");
});

Item.registerIconOverrideFunction(ItemID.angelRing, function(item){
	return {name: 'angelRing', data: ringVariations[item.data] ? item.data : 0};
});

(function(){
	var superTempPlayerSetFlyingEnabled = Player.setFlyingEnabled;
	var superTempPlayerSetFlying = Player.setFlying;
	Player.setFlyingEnabled = function(enabled, forced){
		if(enabled || !ringEquiped || forced)superTempPlayerSetFlyingEnabled(enabled);
	}
	Player.setFlying = function(enabled, forced){
		if(enabled || !ringEquiped || forced)superTempPlayerSetFlying(enabled);
	}
})();

var EntityDataAPI = ModAPI.requireGlobal('EntityDataRegistry');

var wingVertexData = [[0,0,0,0,0],[0,0,1,16,0],[0,-1,0,0,16],[0,-1,1,16,16],[0,0,1,16,0],[0,-1,0,0,16]];
var tickTime = 0;
Callback.addCallback("LocalTick", function() {
	tickTime++;
	var threadTime = World.getThreadTime();
	if(threadTime%2 == 0 && (playerRingData = playerRenders[Player.get()])) {
		playerRingData.inRange = true;
		playerRingData.isFlying = Player.getFlying();
		if (!ringEquiped) {
			if (item = searchItem(ItemID.angelRing)) {
				if(InnerCore_pack.packVersionCode > 108 && playerRingData.lastTexture != (playerRingData.lastTexture = (playerRingData.texture = ringVariations[item.data].texture))){
					playerRingData.render.setTexture(playerRingData.texture);
				}
				Player.setFlyingEnabled(true);
				ringEquiped = true;
				playerRingData.ringEquiped = true;
			}
		} else if (ringEquiped/*  && !baubleEquip */) {
			if (!(item = searchItem(ItemID.angelRing))) {
				ringEquiped = false;
				playerRingData.ringEquiped = false;
				if(Game.getGameMode() != 1){
					Player.setFlyingEnabled(false);
					Player.setFlying(false);
				}
			} else {
				if(!Player.getFlyingEnabled())Player.setFlyingEnabled(true);
				if(InnerCore_pack.packVersionCode > 108 && playerRingData.lastTexture != (playerRingData.lastTexture = (playerRingData.texture = ringVariations[item.data].texture))){
					playerRingData.render.setTexture(playerRingData.texture);
				}
			}
		}
	}
	if(InnerCore_pack.packVersionCode <= 108) return;
	var settings_ = playerRenders[Player.get()];
	if(!settings_) return;
	var xRotate = (1 + Math.cos((tickTime) / 4)) * (settings_.isFlying ? 20 : 2) + 25;
	var wing1 = settings_.wing1;
	var wing2 = settings_.wing2;
	wing1.clear();
	wing2.clear();
	if(settings_.ringEquiped && settings_.texture != 'wings/wing0'){
		wing1.setNormal(0, 0, 1);
		wing2.setNormal(0, 0, 1);
		/* wing1.setColor(1, 1, 1, 1);
		wing2.setColor(1, 1, 1, 1); */
		for(var i in wingVertexData){
			wing1.addVertex(wingVertexData[i][0],wingVertexData[i][1],wingVertexData[i][2],wingVertexData[i][3],wingVertexData[i][4]);
			wing2.addVertex(wingVertexData[i][0],wingVertexData[i][1],wingVertexData[i][2],wingVertexData[i][3],wingVertexData[i][4]);
		}
		wing1.rotate(0,1,0,0, -xRotate * Math.PI/180 - (settings_.isFlying ? 0 : 0.5), 0);
		wing2.rotate(0,1,0,0, xRotate * Math.PI/180 + (settings_.isFlying ? 0 : 0.5), 0);
	}
	wing1.invalidate();
	wing2.invalidate();
});

Callback.addCallback("LocalTick", function() {
	if(InnerCore_pack.packVersionCode > 108)for(var i in _players){
		if(_players[i] == Player.get()) continue;
		var settings_ = playerRenders[_players[i]];
		if(!settings_ || !settings_.inRange) continue;
		var xRotate = (1 + Math.cos((tickTime) / 4)) * (settings_.isFlying ? 20 : 2) + 25;
		var wing1 = settings_.wing1;
		var wing2 = settings_.wing2;
		wing1.clear();
		wing2.clear();
		if(settings_.ringEquiped && settings_.texture != 'wings/wing0'){
			wing1.setNormal(0, 0, 1);
			wing2.setNormal(0, 0, 1);
			/* wing1.setColor(1, 1, 1, 1);
			wing2.setColor(1, 1, 1, 1); */
			for(var i in wingVertexData){
				wing1.addVertex(wingVertexData[i][0],wingVertexData[i][1],wingVertexData[i][2],wingVertexData[i][3],wingVertexData[i][4]);
				wing2.addVertex(wingVertexData[i][0],wingVertexData[i][1],wingVertexData[i][2],wingVertexData[i][3],wingVertexData[i][4]);
			}
			wing1.rotate(0,1,0,0, -xRotate * Math.PI/180 - (settings_.isFlying ? 0 : 0.5), 0);
			wing2.rotate(0,1,0,0, xRotate * Math.PI/180 + (settings_.isFlying ? 0 : 0.5), 0);
		}
		wing1.invalidate();
		wing2.invalidate();
	}
}, -100);


Callback.addCallback("tick", function() {
	var threadTime = World.getThreadTime();
	if(InnerCore_pack.packVersionCode <= 108) return;
	if(threadTime%30 == 0){
		//var tipText = "";
		//tipText += 'allPlayers: ' + _players + '\n';
		for(var i in _players){
			var sendUpdate = false;
			var playerUid = _players[i];
			var playerSettings = serverPlayerRenders[playerUid];
			//tipText += '-----Player: ' + playerUid + '\n';
			if(!playerSettings) continue;
			var tag = Entity.getCompoundTag(playerUid);
			if(tag){
				var tagAbilities = tag.getCompoundTag('abilities');
				if(playerSettings.lastIsFlying != (playerSettings.lastIsFlying = (playerSettings.isFlying = (tagAbilities ? !!tagAbilities.getByte('flying') : false)))) sendUpdate = true;
				//tipText += "tagAbilities: " + !!tagAbilities/* (tagAbilities ? JSON.stringify(tagAbilities.toScriptable()) : null) */ + '\n';
				if(tagAbilities){
					//tipText += 'flying: ' + tagAbilities.getByte('flying') + '\n';
				}
			}
			if (!playerSettings.ringEquiped) {
				if (item = searchItem(ItemID.angelRing, -1, -1, false, false, playerUid)) {
					playerSettings.lastTexture = playerSettings.texture = ringVariations[item.data].texture;
					playerSettings.ringEquiped = true;
					sendUpdate = true;
				}
			} else if (playerSettings.ringEquiped/*  && !baubleEquip */) {
				if (!(item = searchItem(ItemID.angelRing, -1, -1, false, false, playerUid))) {
					playerSettings.ringEquiped = false;
					sendUpdate = true;
				} else {
					if(playerSettings.lastTexture != (playerSettings.lastTexture = (playerSettings.texture = ringVariations[item.data].texture))){
						sendUpdate = true;
					}
				}
			}
			if(sendUpdate) {
				var _PlayerActor = new PlayerActor(playerUid);
				for(var pl in _players){
					var playerUid2 = _players[pl];
					if(playerUid2 == playerUid) continue;
					var __PlayerActor = new PlayerActor(playerUid2);
					var distance = Entity.getDistanceToEntity(playerUid, playerUid2);
					if(distance >= 128 || _PlayerActor.getDimension() != __PlayerActor.getDimension()){
						if(playerSettings.inRange) playerSettings.inRange = false;
						else continue;
					} else playerSettings.inRange = true;
					var client = Network.getClientForPlayer(playerUid2);
					if(client)client.send('Utils.updatePlayerServerData', {player: playerUid, serverData: playerSettings});
				}
			}
			//tipText += 'playerSettings: ' + JSON.stringify(playerSettings) + '\n';
		}
	}
}, -10);

/* ModAPI.addAPICallback("BaublesAPI", function(api) {
	api.Baubles.registerBauble({
		id: ItemID.angelRing,
		type: "ring",
		onEquip: function() {
			Player.setFlyingEnabled(true);
			ringEquiped = true;
			baubleEquip = true;
		},
		onTakeOff: function() {
			ringEquiped = false;
			baubleEquip = false;
			Player.setFlyingEnabled(false);
			Player.setFlying(false);
		}
	});
}) */

Callback.addCallback("EntityHurt", function(attacker, victim, damage, damageType) {
	if (serverPlayerRenders[victim] && serverPlayerRenders[victim].ringEquiped && damageType == 5) {
		Game.prevent();
	}
});

Callback.addCallback('LevelLeft', function(){
	baubleEquip = false;
	ringEquiped = false;
	_players = [];
	playerRenders = {};
	serverPlayerRenders = {};
});

var playerRenders = {};
var serverPlayerRenders = {};

Callback.addCallback('ServerPlayerLoaded', function(player__){
	serverPlayerRenders[player__] = {
		ringEquiped: false,
		isFlying: false,
		lastIsFlying: false,
		texture: '',
		lastTexture: '',
		inRange: false
	}
	Network.sendToAllClients('Utils.updatePlayers', {players: Network.getConnectedPlayers(), player: player__, serverPlayersData: serverPlayerRenders});
});

function createWingsObject(_player){
	//if(!EntityDataAPI.entityData[_player]) return false;
	var __object = playerRenders[_player] = {};
	__object.ringEquiped = false;
	__object.isFlying = false;
	__object.lastTexture = '';
	__object.texture = '';
	if(InnerCore_pack.packVersionCode <= 108) return true;
	__object.wing1 = new RenderMesh();
	__object.wing2 = new RenderMesh();
	__object.render = new ActorRenderer();
	__object.attachable = new AttachableRender(_player);
	__object.render.addPart('body').endPart().addPart('wing1', 'body', __object.wing1).setOffset(1, -4, 1.5).endPart().addPart('wing2', 'body', __object.wing2).setOffset(-1, -4, 1.5).endPart();
	__object.attachable.setRenderer(__object.render);
	return true;
}

Network.addClientPacket('Utils.updatePlayers', function(packetData){
	_players = packetData.players;
	var serverPlayersData = packetData.serverPlayersData;
	for(var i in _players){
		if(!playerRenders[_players[i]]){
			createWingsObject(_players[i])
		}
		if(_players[i] != Player.get() && serverPlayersData[_players[i]]){
			Object.assign(playerRenders[_players[i]], serverPlayersData[_players[i]])
		}
	}
});

Network.addClientPacket('Utils.updatePlayerServerData', function(packetData){
	var serverData = packetData.serverData;
	var _player = packetData.player;
	if(_player != Player.get() && playerRenders[_player]){
		Object.assign(playerRenders[_player], serverData);
		if(InnerCore_pack.packVersionCode > 108)playerRenders[_player].render.setTexture(serverData.texture);
	}
});