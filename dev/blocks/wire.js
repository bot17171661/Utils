var allGroups = {};
var ignored = {}

var regionGroups = {};
var networkTiles = {};
const regionChunkSize = 3;

var BlocksAddToGroup = [];
var NewBlocksAddToGroup = [];
var updateBlocksAddToGroup = false;

var wireTextureSet = [
	["utilsWire", 0],
	["utilsWire", 0],
	["utilsWire", 0],
	["utilsWire", 0],
	["utilsWire", 0],
	["utilsWire", 0]
];
var fixedWireTextureSet = [
	["utilsWire", 0],
	["utilsWire", 0],
	["utilsWireSide", 0],
	["utilsWire", 0],
	["utilsWire", 0],
	["utilsWireSide", 0]
];

IDRegistry.genBlockID("utilsWire");
Block.createBlock("utilsWire", [{
	name: "Pipe",
	texture: wireTextureSet,
	inCreative: true
}]);
mod_tip(BlockID.utilsWire);

IDRegistry.genBlockID("utilsItemGetter");
Block.createBlock("utilsItemGetter", [{
	name: "Extraction pipe",
	texture: [
		["stone", 0]
	],
	inCreative: false
}, //left
{
	name: "Extraction pipe",
	texture: [
		["stone", 0]
	],
	inCreative: false
}, //right
{
	name: "Extraction pipe",
	texture: [
		["stone", 0]
	],
	inCreative: true
}, //forward
{
	name: "Extraction pipe",
	texture: [
		["stone", 0]
	],
	inCreative: false
}, //back
{
	name: "Extraction pipe",
	texture: [
		["stone", 0]
	],
	inCreative: false
}, //up
{
	name: "Extraction pipe",
	texture: [
		["stone", 0]
	],
	inCreative: false
} //down
]);
mod_tip(BlockID.utilsItemGetter);

function calculateCentre(coords, notignoreY){
    var _object = {
		x: coords.x - coords.x%(regionChunkSize*16) + (coords.x >= 0 ?  0.5 + (regionChunkSize*16)/2 : - 0.5 - (regionChunkSize*16)/2), 
		z: coords.z - coords.z%(regionChunkSize*16) + (coords.z >= 0 ?  0.5 + (regionChunkSize*16)/2 : - 0.5 - (regionChunkSize*16)/2)
	};
	if(notignoreY) _object.y = coords.y;
	return _object;
}

const wireNetworkEntityType = new NetworkEntityType('utils.wire');
wireNetworkEntityType.setClientListSetupListener(function(list, target, networkEntity){
	//Logger.Log('SetupNetworkEntity on: ' + cts(target.coords));
	list.setupDistancePolicy(target.coords.x, target.coords.y || 70, target.coords.z, target.blockSource.getDimension(), 128, 128, 1000);
}).addClientPacketListener("updateBlock", function(target, networkEntity, packetData){
	if(!target) {
		networkEntity.send("fixTarget", {});
		return// Logger.Log('No target: ' + JSON.stringify(target));
	}
	if(packetData.ignored) ignored = packetData.ignored;
	if(packetData.regionGroup)target.regionGroup = packetData.regionGroup;
	if(packetData.updateGroup)for(var i in packetData.updateGroup)target.regionGroup[i] = packetData.updateGroup[i];
	var coords = packetData.coords;
	if(packetData.groupAdd){
		for(var i in packetData.groupAdd){
			var name = packetData.groupAdd[i][0];
			var blockId = Network.serverToLocalId(packetData.groupAdd[i][1]);
			ICRender.getGroup(name).add(blockId, -1);
		}
	}
	//alert('updateBlock: ' + JSON.stringify(packetData.updateGroup) + " : " + JSON.stringify(target.regionGroup));
	if(!packetData.destroy)mapGetter(coords, packetData.meta, target.regionGroup, true);
	else {
		BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
		BlockRenderer.unmapCollisionAndRaycastModelAtCoords(target.dim, coords.x, coords.y, coords.z);
	}
}).addServerPacketListener("fixTarget", function(target, networkEntity, client, packetData, _str){
	//Logger.Log('Server get fixTarget packet');
	var __type = networkEntity.getType();
	var data = __type.newClientAddPacket(networkEntity, client);
	networkEntity.send("fixTarget", data);
}).addClientPacketListener("fixTarget", function(target, networkEntity, packetData, _str){
	//Logger.Log('Client get fixTarget packet');
	var __type = networkEntity.getType();
	__type.onClientEntityAdded(networkEntity, packetData);
}).setClientAddPacketFactory(function(target, networkEntity, client){
	//Logger.Log('SendInitPacketToClient: ' + JSON.stringify({coords: target.coords, dim: target.blockSource.getDimension(), regionGroup: (regionGroups['d'+target.blockSource.getDimension()] || {})[cts(target.coords)]}));
	return {coords: target.coords, dim: target.blockSource.getDimension(), regionGroup: (regionGroups['d'+target.blockSource.getDimension()] || {})[cts(target.coords)]};
}).setClientEntityRemovedListener(function(target, networkEntity){
	for (var i in target.regionGroup) {
		var splited = i.split(",");
		var coords = {
			x: Number(splited[0]),
			y: Number(splited[1]),
			z: Number(splited[2])
		};
		BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
		BlockRenderer.unmapCollisionAndRaycastModelAtCoords(target.dim, coords.x, coords.y, coords.z);
	}
}).setClientEntityAddedListener(function(networkEntity, packetData){
	//Logger.Log('ClientEntityAdded: ' + JSON.stringify(packetData));
	for (var i in packetData.regionGroup) {
		if(!packetData.regionGroup) continue;
		var splited = i.split(",");
		var coords = {
			x: Number(splited[0]),
			y: Number(splited[1]),
			z: Number(splited[2])
		};
		if (packetData.regionGroup[i].not) {
			for (var d in packetData.regionGroup[i].not) {
				ICRender.getGroup("not" + coords.x + "," + coords.y + "," + coords.z + ":" + packetData.regionGroup[i].not[d].x + "," + packetData.regionGroup[i].not[d].y + "," + packetData.regionGroup[i].not[d].z + "utilsWire" + packetData.dim).add(World.getBlock(packetData.regionGroup[i].not[d].x, packetData.regionGroup[i].not[d].y, packetData.regionGroup[i].not[d].z).id, -1);
			}
		};
		mapGetter(coords, packetData.regionGroup[i].meta, packetData.regionGroup, true);
	}
	return packetData;
});

Callback.addCallback('tick', function(){
	if(World.getThreadTime()%40 != 0) return;
	for(var dim in networkTiles){
		if(!networkTiles[dim]) continue;
		for(var i in networkTiles[dim]){
			var networkTile = networkTiles[dim][i]
			if(!networkTile) continue;
			networkTile.refreshClients();
		}
	}
}, -50);

function createTargetData(coords, blockSource){
	var returnData = {
		coords: {x: coords.x, z: coords.z},
		blockSource: blockSource || coords.blockSource
	}
	if(coords.y != undefined) returnData.coords.y = coords.y;
	return returnData;
}

Saver.addSavesScope("UtilsWire",
	function read(scope) {
		allGroups = scope ? scope.allGroups || {} : {};
	},
	function save() {
		return {allGroups: allGroups || {}};
	}
);

function getDataOnSide(side) {
	var blockDaata = [4, 5, 1, 0, 2, 3];
	return blockDaata[side];
}

function getSideOnData(data) {
	var blockDaata = [4, 5, 1, 0, 2, 3];
	return blockDaata.indexOf(data);
}

Callback.addCallback("LevelLeft", function () {
	allGroups = {};
	ignored = {}
	regionGroups = {};
	networkTiles = {};
});

Callback.addCallback('LevelLoaded', function(){
	for(var dim in allGroups){
		var fixedDim = Number(dim.substr(1));
		if(!fixedDim && fixedDim != 0) continue;
		var groups = allGroups[dim] || (allGroups[dim] = {});
		var blockSource = BlockSource.getDefaultForDimension(fixedDim);
		var createNetworkTiles = [];
		for (var i in groups) {
			var splited = i.split(",");
			var coords = {
				x: Number(splited[0]),
				y: Number(splited[1]),
				z: Number(splited[2])
			};
			var regionCentreCoords = calculateCentre(coords);
			var string_regionCentreCoords = cts(regionCentreCoords);
			((_regionGroup = (regionGroups[dim] || (regionGroups[dim] = {})))[string_regionCentreCoords] || (_regionGroup[string_regionCentreCoords] = {}))[i] = groups[i];
			createNetworkTiles.push([string_regionCentreCoords, regionCentreCoords]);
			mapGetter(coords, groups[i].meta, groups, true, blockSource);
		}
		if(!networkTiles[dim])networkTiles[dim] = {};
		for(var k in createNetworkTiles){
			var string_regionCentreCoords = createNetworkTiles[k][0];
			var regionCentreCoords = createNetworkTiles[k][1];
			if(!networkTiles[dim][string_regionCentreCoords]){
				networkTiles[dim][string_regionCentreCoords] = new NetworkEntity(wireNetworkEntityType, createTargetData(regionCentreCoords, blockSource));
			}
		}
	}
});

Block.registerPlaceFunction('utilsItemGetter', function (coords, item, block, _player, blockSource){
	//Game.prevent();
	var set_coords = coords;
    if(!World.canTileBeReplaced(block.id, block.data)){
		var relBlock = blockSource.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
		if (World.canTileBeReplaced(relBlock.id, relBlock.data)){
			set_coords = coords.relative;
		} else return;
	}
	blockData = getDataOnSide(coords.side);
	blockSource.setBlock(set_coords.x, set_coords.y, set_coords.z, BlockID.utilsItemGetter, blockData);
	World.addTileEntity(set_coords.x, set_coords.y, set_coords.z, blockSource);
	if(item.count == 0) item = {id:0,count:1,data:0,extra:null}
	Entity.setCarriedItem(_player, item.id, item.count - 1, item.data, item.extra);
});
Block.registerPlaceFunction('utilsWire', function (coords, item, block, _player, blockSource){
	//Game.prevent();
	var set_coords = coords;
    if(!World.canTileBeReplaced(block.id, block.data)){
		var relBlock = blockSource.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
		if (World.canTileBeReplaced(relBlock.id, relBlock.data)){
			set_coords = coords.relative;
		} else return;
	}
	blockSource.setBlock(set_coords.x, set_coords.y, set_coords.z, BlockID.utilsWire, 0);
	if(item.count == 0) item = {id:0,count:1,data:0,extra:null}
	Entity.setCarriedItem(_player, item.id, item.count - 1, item.data, item.extra);
});

function onItemGetterWireCreated(coords, blockSource, blockData){
	var currentDimension = blockSource.getDimension();
	var idcurrentDimension = 'd' + currentDimension;
	if(!allGroups[idcurrentDimension]) allGroups[idcurrentDimension] = {};
	var groups = allGroups[idcurrentDimension];
	var regionCentreCoords = calculateCentre(coords);
	var string_regionCentreCoords = cts(regionCentreCoords);
	var _regionGroup = ((_regionDimGroup = (regionGroups[idcurrentDimension] || (regionGroups[idcurrentDimension] = {})))[string_regionCentreCoords] || (_regionDimGroup[string_regionCentreCoords] = {}));
	var groupCoordsId = cts(coords);
	var updateGroup = {};
	groups[groupCoordsId] = updateGroup[groupCoordsId] = _regionGroup[groupCoordsId] = {
		meta: blockData
	};
	if(!networkTiles[idcurrentDimension])networkTiles[idcurrentDimension] = {};
	if(!(_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords])){
		_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords] = new NetworkEntity(wireNetworkEntityType, createTargetData(regionCentreCoords, blockSource));
	}
	_networkTile.send("updateBlock", {coords: coords, meta: blockData, updateGroup: updateGroup});
	mapGetter(coords, blockData, groups, true, blockSource);
};
function onWireCreated(coords, blockSource){
	var currentDimension = blockSource.getDimension();
	var idcurrentDimension = 'd' + currentDimension;
	if(!allGroups[idcurrentDimension]) allGroups[idcurrentDimension] = {};
	var groups = allGroups[idcurrentDimension];
	var regionCentreCoords = calculateCentre(coords);
	var string_regionCentreCoords = cts(regionCentreCoords);
	var _regionGroup = ((_regionDimGroup = (regionGroups[idcurrentDimension] || (regionGroups[idcurrentDimension] = {})))[string_regionCentreCoords] || (_regionDimGroup[string_regionCentreCoords] = {}));
	var groupCoordsId = cts(coords);
	var updateGroup = {};
	groups[groupCoordsId] = updateGroup[groupCoordsId] = _regionGroup[groupCoordsId] = {};
	if(!networkTiles[idcurrentDimension])networkTiles[idcurrentDimension] = {};
	if(!(_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords])){
		_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords] = new NetworkEntity(wireNetworkEntityType, createTargetData(regionCentreCoords, blockSource));
	}
	_networkTile.send("updateBlock", {coords: coords, updateGroup: updateGroup});
	mapGetter(coords, undefined, groups, true, blockSource);
	Threading.initThread('searchContainersThread', function(){
		searchContainers(coords, coords, blockSource);
	}, -1);
};
function onDestroyWireBlock(coords, blockSource){
	var regionCentreCoords = calculateCentre(coords);
	var string_regionCentreCoords = cts(regionCentreCoords);
	var groupCoordsId = cts(coords);
	var currentDimension = blockSource.getDimension();
	var idcurrentDimension = 'd' + currentDimension;
	if(!allGroups[idcurrentDimension]) allGroups[idcurrentDimension] = {};
	if(!regionGroups[idcurrentDimension]) regionGroups[idcurrentDimension] = {};
	delete allGroups[idcurrentDimension][groupCoordsId];
	if(regionGroups[idcurrentDimension][string_regionCentreCoords])delete regionGroups[idcurrentDimension][string_regionCentreCoords][groupCoordsId];
	BlockRenderer.unmapCollisionAndRaycastModelAtCoords(blockSource.getDimension(), coords.x, coords.y, coords.z);
	if(!networkTiles[idcurrentDimension])networkTiles[idcurrentDimension] = {};
	if(!(_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords])){
		_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords] = new NetworkEntity(wireNetworkEntityType, createTargetData(regionCentreCoords, blockSource));
	}
	var updateGroup = {};
	updateGroup[groupCoordsId] = undefined;
	_networkTile.send("updateBlock", {coords: coords, updateGroup: updateGroup, destroy: true});
}; 
World.registerBlockChangeCallback([BlockID.utilsWire, BlockID.utilsItemGetter], function(coords, oldBlock, newBlock, blockSource){
	if(oldBlock.id == newBlock.id) return;
	if(oldBlock.id == BlockID.utilsWire || oldBlock.id == BlockID.utilsItemGetter)onDestroyWireBlock(coords, blockSource);
	if(newBlock.id == BlockID.utilsWire)onWireCreated(coords, blockSource);
	if(newBlock.id == BlockID.utilsItemGetter)onItemGetterWireCreated(coords, blockSource, newBlock.data);
});
Recipes.addShaped({
	id: BlockID.utilsWire,
	count: 16,
	data: 0
}, [
	"sss",
	"iii",
	"sss"
], ['i', 265, 0, 's', 1, 0]);
Recipes.addShaped({
	id: BlockID.utilsItemGetter,
	count: 1,
	data: 2
}, [
	"ssi",
	"iih",
	"ssi"
], ['i', 265, 0, 's', 1, 0, 'h', 410, 0]);


const width = 0.1875;
const centerWidth = 0.3125;
const sideSize = 0.03;

var boxesWire = [
	[0.5 - width / 2, 0.5 - width / 2, 0 + sideSize, 0.5 + width / 2, 0.5 + width / 2, 0.5 - width / 2], //left
	[0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, 1 - sideSize], //right
	[0.5 + width / 2, 0.5 - width / 2, 0.5 - width / 2, 1 - sideSize, 0.5 + width / 2, 0.5 + width / 2], //forward
	[0 + sideSize, 0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2], //back
	[0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2, 1 - sideSize, 0.5 + width / 2], //up
	[0.5 - width / 2, 0 + sideSize, 0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2] //down
];

var boxes1 = [{
	side: [1, 0, 0],
	box: [0.5 + width / 2, 0.5 - width / 2, 0.5 - width / 2, 1, 0.5 + width / 2, 0.5 + width / 2]
},
{
	side: [-1, 0, 0],
	box: [0, 0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2]
},
{
	side: [0, 1, 0],
	box: [0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2, 1, 0.5 + width / 2]
},
{
	side: [0, -1, 0],
	box: [0.5 - width / 2, 0, 0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2]
},
{
	side: [0, 0, 1],
	box: [0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, 1]
},
{
	side: [0, 0, -1],
	box: [0.5 - width / 2, 0.5 - width / 2, 0, 0.5 + width / 2, 0.5 + width / 2, 0.5 - width / 2]
}];

var clickBoxes = [{
	side: 4,
	box: [0.5 + centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 1, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2]
},
{
	side: 5,
	box: [0, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2]
},
{
	side: 1,
	box: [0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 1, 0.5 + centerWidth / 2]
},
{
	side: 0,
	box: [0.5 - centerWidth / 2, 0, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2]
},
{
	side: 3,
	box: [0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 1]
},
{
	side: 2,
	box: [0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 - centerWidth / 2]
}];

(function () {

	var group = ICRender.getGroup("utilsWire");
	group.add(BlockID.utilsItemGetter, -1);
	group.add(BlockID.utilsWire, -1);

	var boxes = [
		[
			[0.2, 0.2, 0, 0.8, 0.8, sideSize] //left
		],
		[
			[0.8, 0.8, 1 - sideSize, 0.2, 0.2, 1] //right
		],
		[
			[1 - sideSize, 0.8, 0.8, 1, 0.2, 0.2] //forward
		],
		[
			[0, 0.2, 0.2, sideSize, 0.8, 0.8] //back
		],
		[
			[0.8, 1 - sideSize, 0.8, 0.2, 1, 0.2] //up
		],
		[
			[0.2, 0, 0.2, 0.8, sideSize, 0.8] //down
		]
	];

	for (var meta = 0; meta < 6; meta++) {
		var boxe = boxes[meta];
		var wire = boxesWire[meta]

		var Dmodel = new ICRender.CollisionShape();
		var render = new ICRender.Model();
		var model = BlockRenderer.createModel();
		for (var n in boxe) {
		  var box = boxe[n];
		  //var model = BlockRenderer.createModel();
		  model.addBox(box[0], box[1], box[2], box[3], box[4], box[5], 155, 0);
		  //render.addEntry(model);
		}
		model.addBox(wire[0], wire[1], wire[2], wire[3], wire[4], wire[5], wireTextureSet);
		model.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, wireTextureSet);
		render.addEntry(model);

		var entry = Dmodel.addEntry();
		entry.addBox(0.2, 0.2, 0.2, 0.8, 0.8, 0.8);
		BlockRenderer.setCustomCollisionShape(BlockID.utilsItemGetter, meta, Dmodel)
		BlockRenderer.enableCoordMapping(BlockID.utilsItemGetter, meta, render);
	}
	var Dmodel = new ICRender.CollisionShape();
	var render = new ICRender.Model();
	var model = BlockRenderer.createModel();
	model.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, wireTextureSet);
	render.addEntry(model);
	var entry = Dmodel.addEntry();
	entry.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2);
	BlockRenderer.setCustomCollisionShape(BlockID.utilsWire, -1, Dmodel);
	BlockRenderer.enableCoordMapping(BlockID.utilsWire, -1, render);
})();

function mapGetter(coords, meta, groups, atach, blockSource) {
	coords.x = Number(coords.x);
	coords.y = Number(coords.y);
	coords.z = Number(coords.z);

	var boxes = [
		[
			[0.2, 0.2, 0, 0.8, 0.8, sideSize] //left
		],
		[
			[0.8, 0.8, 1 - sideSize, 0.2, 0.2, 1] //right
		],
		[
			[1 - sideSize, 0.8, 0.8, 1, 0.2, 0.2] //forward
		],
		[
			[0, 0.2, 0.2, sideSize, 0.8, 0.8] //back
		],
		[
			[0.8, 1 - sideSize, 0.8, 0.2, 1, 0.2] //up
		],
		[
			[0.2, 0, 0.2, 0.8, sideSize, 0.8] //down
		]
	];

	var boxe = [];
	if (meta >= 0) {
		boxe = boxes[meta];
		var wire = boxesWire[meta]
	}

	var Dmodel = new ICRender.CollisionShape();
	var render = new ICRender.Model();
	var model = BlockRenderer.createModel();
	var _entry = Dmodel.addEntry();
	for (var n in boxe) {
		var box = boxe[n];
		//var model = BlockRenderer.createModel();
		if(!blockSource)model.addBox(box[0], box[1], box[2], box[3], box[4], box[5], 155, 0);
		_entry.addBox(box[0], box[1], box[2], box[3], box[4], box[5]);
		//render.addEntry(model);
	}
	if (meta >= 0 && !blockSource) model.addBox(wire[0], wire[1], wire[2], wire[3], wire[4], wire[5], wireTextureSet);
	if (meta >= 0) _entry.addBox(wire[0], wire[1], wire[2], wire[3], wire[4], wire[5]);
	if(!blockSource)model.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, wireTextureSet);
	render.addEntry(model);
	_entry.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2);
	var _dimension = blockSource ? blockSource.getDimension() : Player.getDimension();
	for (var l in boxes1) {
		var box = boxes1[l];
		var blockg = groups[(coords.x + box.side[0]) + "," + (coords.y + box.side[1]) + "," + (coords.z + box.side[2])];
		if (!atach && blockg) {
			//if(!blockSource)BlockRenderer.unmapAtCoords(coords.x + box.side[0], coords.y + box.side[1], coords.z + box.side[2]);
			var crds = {
				x: coords.x + box.side[0],
				y: coords.y + box.side[1],
				z: coords.z + box.side[2]
			}
			mapGetter(crds, blockg.meta, groups, true, blockSource)
		}
		if(!blockSource)var model = BlockRenderer.createModel();
		if(!blockSource)model.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5], fixedWireTextureSet);
		var gp = "not" + coords.x + "," + coords.y + "," + coords.z + ":" + (coords.x + box.side[0]) + "," + (coords.y + box.side[1]) + "," + (coords.z + box.side[2]) + "utilsWire" + _dimension;
		//var gp2 = "not" + (coords.x + box.side[0]) + "," + (coords.y + box.side[1]) + "," + (coords.z + box.side[2]) + ":" + coords.x + "," + coords.y + "," + coords.z + "utilsWire";
		if(!blockSource)render.addEntry(model).setCondition(ICRender.AND(ICRender.BLOCK(box.side[0], box.side[1], box.side[2], ICRender.getGroup(gp + (ignored[gp] >= 0 ? ignored[gp] : '')), true), ICRender.BLOCK(box.side[0], box.side[1], box.side[2], ICRender.getGroup("utilsWire"), false)));
		var entry = Dmodel.addEntry();
		entry.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5]);
		entry.setCondition(ICRender.AND(ICRender.BLOCK(box.side[0], box.side[1], box.side[2], ICRender.getGroup(gp + (ignored[gp] >= 0 ? ignored[gp] : '')), true), ICRender.BLOCK(box.side[0], box.side[1], box.side[2], ICRender.getGroup("utilsWire"), false)));
	}
	if(!blockSource)BlockRenderer.mapAtCoords(coords.x, coords.y, coords.z, render);
	BlockRenderer.mapCollisionAndRaycastModelAtCoords(_dimension, coords.x, coords.y, coords.z, Dmodel);
}

function coordsOnBlockData(blockData, coords) {
	var retCoords = [{
		x: coords.x,
		y: coords.y,
		z: coords.z - 1
	},
	{
		x: coords.x,
		y: coords.y,
		z: coords.z + 1
	},
	{
		x: coords.x + 1,
		y: coords.y,
		z: coords.z
	},
	{
		x: coords.x - 1,
		y: coords.y,
		z: coords.z
	},
	{
		x: coords.x,
		y: coords.y + 1,
		z: coords.z
	},
	{
		x: coords.x,
		y: coords.y - 1,
		z: coords.z
	}]

	return retCoords[blockData];
}

Network.addClientPacket('Utils.updateGroups', function(packetData){
	for(var i in packetData.NewBlocksAddToGroup){
		ICRender.getGroup("utilsWire").add(Network.serverToLocalId(packetData.NewBlocksAddToGroup[i]), -1);
	}
});

Callback.addCallback('tick', function(){
	if(updateBlocksAddToGroup){
		updateBlocksAddToGroup = false;
		Network.sendToAllClients('Utils.updateGroups', {NewBlocksAddToGroup: NewBlocksAddToGroup});
		NewBlocksAddToGroup = [];
	}
});

Callback.addCallback('ServerPlayerLoaded', function(player__){
	var client = Network.getClientForPlayer(player__);
	if(client)client.send('Utils.updateGroups', {NewBlocksAddToGroup: BlocksAddToGroup})
});

function searchContainers(coordsf, outCoordsf, blockSource) {
	var containers = [];
	var outCoords = [];
	var started = [];
	function asdds(coords) {
		if (started.indexOf(cts(coords)) != -1) return;
		started.push(cts(coords));
		var tc;
		var bon_wires = [];
		for (var i in newSides) {
			var coordss = {};
			var bonus;

			coordss.x = coords.x + newSides[i][0];
			coordss.y = coords.y + newSides[i][1];
			coordss.z = coords.z + newSides[i][2];
			coordss_string = cts(coordss);
			if(outCoords.indexOf(coordss_string) != -1) continue;
			var block = blockSource.getBlock(coordss.x, coordss.y, coordss.z);
			if (blockSource.getBlockId(coords.x, coords.y, coords.z) == BlockID.utilsItemGetter && (_bonusTile = World.getTileEntity(coords.x, coords.y, coords.z, blockSource))) bonus = _bonusTile.data.target;
			var not = false;
			if(!allGroups[0]) allGroups[0] = {};
			var groups = allGroups['d' + blockSource.getDimension()];
			if (groups && groups[cts(coords)] && groups[cts(coords)].not && groups[cts(coords)].not.map(function (d) {
				return d.x + ',' + d.y + ',' + d.z
			}).indexOf(coordss_string) != -1) not = true;
			if (coordss_string != (bonus ? cts(bonus) : '') && !not) {
				var cont = World.getContainer(coordss.x, coordss.y, coordss.z, blockSource);
				var tile = World.getTileEntity(coordss.x, coordss.y, coordss.z, blockSource) || World.addTileEntity(coordss.x, coordss.y, coordss.z, blockSource);
				if (cont) {
					//devLog("Tile found");
					tc = {
						container: cont,
						type: "vanilla",
						side: i
					};
					if (!tile) {
						//devLog("Vanilla tile");
						tc.size = cont.size;
						tc.slots = [];
						for (var k = 0; k < tc.size; k++) {
							tc.slots.push(k);
						}
					} else if (tile && ((tile.getTransportSlots && tile.getTransportSlots().input) || tile.interface)) {
						//devLog("Mod tile");
						tc.type = "modded";
						tc.TileEntity = tile;
						if (tile.interface) tc.SI = true;
						if (tc.SI) tc.slots = tile.interface.getInputSlots(reverseSides[i]);
						else if(tile.getTransportSlots) tc.slots = tile.getTransportSlots().input;
						tc.size = tc.slots.length;
					} else if (tile && !tile.getTransportSlots && !tile.interface) {
						//devLog("Container not have slots");
						tc = false;
					}
				}
				if (tc && (containers && !containers.find(function (element, index, array) {
					if (element.x == coordss.x && element.y == coordss.y && element.z == coordss.z) return index;
				}))) {
					tc.x = coordss.x;
					tc.y = coordss.y;
					tc.z = coordss.z;
					if (tc.size > 0) {
						if(block.id != 0 && BlocksAddToGroup.indexOf(block.id) == -1){
							BlocksAddToGroup.push(block.id);
							NewBlocksAddToGroup.push(block.id);
							updateBlocksAddToGroup = true;
						}
					}
					containers.push(tc);
					tc = false;
				}
				if (block.id == BlockID.utilsWire || block.id == BlockID.utilsItemGetter) {
					bon_wires.push({ coordss: coordss, out: coords });
				}
			}
		}
		for (var i in bon_wires) {
			outCoords.push(cts(bon_wires[i].out));
			asdds(bon_wires[i].coordss);
		}
	}
	outCoords.push(cts(outCoordsf));
	asdds(coordsf);
	return containers;

}

function targetIsContainer(coords, _item_data, blockSource) {
	var tc = false;
	var coordss = coords;
	var __container = World.getContainer(coordss.x, coordss.y, coordss.z, blockSource);
	var __tileentity = World.getTileEntity(coordss.x, coordss.y, coordss.z, blockSource) || World.addTileEntity(coordss.x, coordss.y, coordss.z, blockSource);
	if (__container) {
		//devLog("target found");
		var _side = getSideOnData(_item_data);
		tc = {
			container: __container,
			type: "vanilla",
			side: reverseSides[_side]
		};
		if (!__tileentity) {
			//devLog("target vanilla tile");
			tc.size = __container.size;
			tc.slots = [];
			for (var k = 0; k < tc.size; k++) {
				tc.slots.push(k);
			}
		} else if (__tileentity && ((__tileentity.getTransportSlots && __tileentity.getTransportSlots().output) || __tileentity.interface)) {
			//devLog("target mod tile");
			tc.type = "modded";
			tc.TileEntity = __tileentity;
			if (tc.TileEntity.interface) tc.SI = true;
			if (tc.SI) tc.slots = tc.TileEntity.interface.getOutputSlots(_side);
			else if(__tileentity.getTransportSlots) tc.slots = __tileentity.getTransportSlots().output;
			tc.size = tc.slots.length;
		} else if (__tileentity && !__tileentity.getTransportSlots && !__tileentity.interface) {
			tc = false;
		}
	}

	return tc;
}

function _whiteList(element) {
	if (element.id == this.item.id && (this.ignore_item_data || element.data == -1 || element.data == this.item.data)) return true;
}
function searchExportSlot(tile1, wireTile) {
	var container = tile1.container;
	var slots = tile1.slots;
	for (var i in slots) {
		if (container.getSlot(slots[i]).id != 0 && (!tile1.SI || !tile1.TileEntity.interface.slots[slots[i]].canOutput || tile1.TileEntity.interface.slots[slots[i]].canOutput(container.getSlot(slots[i]), tile1.side, tile1.TileEntity))) {
			//devLog("True slot: " + slots[i]);
			var item = container.getSlot(slots[i]);
			if ((wireTile.data.black_list.length == 0 || !wireTile.data.black_list.find(_whiteList, {item: item, ignore_item_data: wireTile.data.ignore_item_data})) && (wireTile.data.white_list.length == 0 || wireTile.data.white_list.find(_whiteList, {item: item, ignore_item_data: wireTile.data.ignore_item_data}))) 
				return slots[i];
			else
				continue;
		} else {
			//devLog("Slot not found");
			continue;
		}
	}
	return 'not found';
}

function searchImportSlot(containers, item) {
	for (var cont in containers) {
		for (var slot in containers[cont].slots) {
			var item2 = containers[cont].container.getSlot(containers[cont].slots[slot]);
			if ((item2.id == 0 || (item2.id == item.id && item2.extra == item.extra && item2.data == item.data && item2.count < Item.getMaxStack(item.id))) && (!containers[cont].SI || ((!containers[cont].TileEntity.interface.isValidInput || containers[cont].TileEntity.interface.isValidInput(item, containers[cont].side, containers[cont].TileEntity)) && (!containers[cont].TileEntity.interface.slots[containers[cont].slots[slot]].isValid || containers[cont].TileEntity.interface.slots[containers[cont].slots[slot]].isValid(item, containers[cont].side, containers[cont].TileEntity))))) {
				return {
					slot: containers[cont].slots[slot],
					container: containers[cont].container
				};
			} else {
				continue;
			}
		}
	}
	return false;
}

function pay(container1, container2, slot1, slot2, item) {
	var item1 = container1.getSlot(slot1);
	if (item1.count != item.count) return;
	var item2 = container2.getSlot(slot2);
	var count = Math.min(item2.count + item.count, 64);
	var other = Math.max(item2.count + item.count - 64, 0);
	container2.setSlot(slot2, item.id, count, item.data, item.extra || null);
	container1.setSlot(slot1, item1.id, other, item1.data, item1.extra || null)
	if (container1.validateSlot) container1.validateSlot(slot1);
	if (container2.validateSlot) container2.validateSlot(slot2);
}

function apply() {
	var target = targetIsContainer(this.data.target, this.data.blockData, this.blockSource);
	if (!target) return;//devLog("!target");
	var exportSlot = searchExportSlot(target, this);
	if (exportSlot == 'not found') return;//devLog("export slot not found");
	var containers = searchContainers(this, this.data.target, this.blockSource);
	if (containers.length == 0) return;// devLog("no containers");
	var importData = searchImportSlot(containers, target.container.getSlot(exportSlot));
	if (!importData) return;//devLog("no import slot");
	pay(target.container, importData.container, exportSlot, importData.slot, target.container.getSlot(exportSlot));
}

var wireGuiData = {
	list_mode: false,
	ignore_item_data: false
};

var wireGUI_elements = {};
function init_wireGUI_elements(){
	wireGUI_elements["DellayScroll"] = {
		type: "scroll",
		x: 100 + 225,
		y: 180/575.5*UI.getScreenHeight(),
		length: 800 - 225,
		min: 5,
		max: 120,
		isInt: true,
		value: 0,
		onNewValue: function (value, itemContainerUiHandler, element) {
			if(!itemContainerUiHandler || !wireGuiData.networkData || wireGuiData.networkData.getInt('updateFreq', 0) == value) return;
			wireGuiData.networkData.putInt('updateFreq', value);
			wireGuiData.networkData.putBoolean('update', true);
			itemContainerUiHandler.setBinding('text', 'text', Translation.translate("Update frequency (in ticks)") + " : " + value);
		}
	},
	wireGUI_elements["text"] = {
		type: "text",
		x: 420,
		y: 130/575.5*UI.getScreenHeight(),
		font: {
			size: 20/575.5*UI.getScreenHeight(),
			color: android.graphics.Color.DKGRAY
		},
		text: "Частота обновления (в тиках) : 0"
	},
	wireGUI_elements["text2"] = {
		type: "text",
		x: 1000 - 225,
		y: 30/575.5*UI.getScreenHeight(),
		font: {
			color: android.graphics.Color.DKGRAY,
			//shadow: 0.5,
			size: 15
		},
		text: Translation.translate("1 second = 20 ticks")
	}
	var slot_size = 60/575.5*UI.getScreenHeight();
	var slots_count = 20;
	var slotsXSstart = 350;
	var slotsYSstart = 300/575.5*UI.getScreenHeight()
	slot_size = Math.min(slot_size, (950 - slotsXSstart)/(slots_count/2));
	for(var i = 0; i < slots_count; i++){
		wireGUI_elements['slot'+i] = {
			id: i,
			type: "slot",
			x: slotsXSstart + slot_size*(i % (slots_count/2)),
			y: slotsYSstart + slot_size*Math.floor(i/(slots_count/2)),
			z: 100,
			size: slot_size
		}
	}
	wireGUI_elements["DellayScroll"].length = slotsXSstart + slot_size*parseInt(slots_count/2) - 25/575.5*UI.getScreenHeight() - wireGUI_elements["DellayScroll"].x;
	var filter_cons = 10/575.5*UI.getScreenHeight();
	var image_cons = 5/575.5*UI.getScreenHeight();
	wireGUI_elements["list_mode"] = {
		type: "button",
		x: 0,
		y: wireGUI_elements['slot0'].y,
		bitmap: 'RS_empty_button',
		bitmap2: 'RS_empty_button_pressed',
		scale: (slot_size*2 - filter_cons)/2/24,
		clicker: {
			onClick: function (itemContainerUiHandler, container, element) {
				container.sendEvent("updateListMode", {list_mode: wireGuiData.list_mode = !wireGuiData.list_mode});
			},
			onLongClick: function (itemContainerUiHandler, container, element) {
				
			}
		}
	}
	wireGUI_elements["list_mode"].x = wireGUI_elements['slot0'].x - filter_cons - (20 * wireGUI_elements["list_mode"].scale);

	wireGUI_elements["image_list_mode"] = {
		type: "image",
		x: 0,
		y: 0,
		z: 1000,
		bitmap: "wire_black_list",
		scale: 1,
	}
	wireGUI_elements["image_list_mode"].scale = (20*wireGUI_elements["list_mode"].scale - image_cons)/30/575.5*UI.getScreenHeight();
	wireGUI_elements["image_list_mode"].x = wireGUI_elements["list_mode"].x + image_cons;
	wireGUI_elements["image_list_mode"].y = wireGUI_elements["list_mode"].y + (wireGUI_elements["list_mode"].scale * 20 - wireGUI_elements["image_list_mode"].scale*24) / 2,

	wireGUI_elements["ignore_item_data"] = {
		type: "button",
		x: wireGUI_elements["list_mode"].x,
		y: wireGUI_elements["list_mode"].y + (wireGUI_elements["list_mode"].scale * 20) + filter_cons,
		bitmap: 'RS_empty_button',
		bitmap2: 'RS_empty_button_pressed',
		scale: wireGUI_elements["list_mode"].scale,
		clicker: {
			onClick: function (itemContainerUiHandler, container, element) {
				container.sendEvent("updateIgnoreItemData", {ignore_item_data: wireGuiData.ignore_item_data = !wireGuiData.ignore_item_data});
			},
			onLongClick: function (itemContainerUiHandler, container, element) {
				
			}
		}
	}

	wireGUI_elements["image_ignore_item_data"] = {
		type: "image",
		x: 0,
		y: 0,
		z: 1000,
		bitmap: "item_data_not_ignore",
		scale: 1/575.5*UI.getScreenHeight(),
	}
	wireGUI_elements["image_ignore_item_data"].scale = (20*wireGUI_elements["ignore_item_data"].scale - image_cons)/24/575.5*UI.getScreenHeight();
	wireGUI_elements["image_ignore_item_data"].x = wireGUI_elements["ignore_item_data"].x + (wireGUI_elements["ignore_item_data"].scale * 20 - wireGUI_elements["image_ignore_item_data"].scale * 24) / 2
	wireGUI_elements["image_ignore_item_data"].y = wireGUI_elements["ignore_item_data"].y + (wireGUI_elements["ignore_item_data"].scale * 20 - wireGUI_elements["image_ignore_item_data"].scale * 24) / 2
}
init_wireGUI_elements();

var wireGUI = new UI.StandartWindow({
	standart: {
		header: {
			text: {
				text: Translation.translate('Extraction pipe')
			}
		},
		inventory: {
			padding: 20,
			width: 225
		},
		background: {
			standart: true
		}
	},
	drawing: [],
	elements: wireGUI_elements
});
wireGUI.getWindow('main').forceRefresh();

TileEntity.registerPrototype(BlockID.utilsItemGetter, {
	defaultValues: {
		blockData: 0,
		target: { x: 0, y: 0, z: 0 },
		slot: null,
		ticks: 0,
		updateFreq: 60,
		value: 0,
		black_list: [],
		white_list: [],
		list_mode: 'black_list',
		ignore_item_data: false
	},
	useNetworkItemContainer: true,
	click: function (id, count, data, coords, player, extra) {
		if (wrenches.indexOf(id) != -1 || Entity.getSneaking(player)) return false;
        var client = Network.getClientForPlayer(player);
        if(!client) return true;
        if (this.container.getNetworkEntity().getClients().contains(client)) return true;
        this.container.openFor(client, "main");
		return true;
	},
    getScreenByName: function(screenName) {
        if(screenName == 'main')return wireGUI;
    },
	created: function () {
        if(!this.blockSource)this.blockSource = BlockSource.getDefaultForDimension(this.dimension);
		this.data.blockData = this.blockSource.getBlock(this.x, this.y, this.z).data;
		this.data.target = coordsOnBlockData(this.data.blockData, this);
	},
	update_list_mode: function(mode){
		if(mode == 'white_list'){
			this.data.white_list = this.data.black_list;
			this.data.black_list = [];
		} else {
			this.data.black_list = this.data.white_list;
			this.data.white_list = [];
		}
		this.data.list_mode = mode;
	},
	tick: function () {
		this.data.ticks++;
		if (this.data.ticks >= this.data.updateFreq) {
			this.data.ticks = 0;
			apply.apply(this);
		}
	},
	init: function () {
		if (!this.data.target) this.created();
		if (!this.data.black_list)this.data.black_list = [];
		if (!this.data.white_list)this.data.white_list = [];
		searchContainers(this, this.data.target, this.blockSource);
		this.data.updateFreq = Math.max(5, Math.min(this.data.updateFreq, 120));
		var tile = this;
		this.container.addServerOpenListener({
			onOpen: function(container, client){
				tile.updateWindow(client);
			}
		});
		this.container.setGlobalAddTransferPolicy({
			transfer: function(itemContainer, slot, id, count, data, extra, player){
				var thisSlot = itemContainer.getSlot(slot);
				if(thisSlot.id != 0) return 0;
				tile.data[tile.data.list_mode].push({id: id, data: data});
				itemContainer.setSlot(slot, id, 1, data, extra);
				return 0;
			}
		})
		this.container.setGlobalGetTransferPolicy({
			transfer: function(itemContainer, slot, id, count, data, extra, player){
				if(id == 0) return 0;
				var index = tile.data[tile.data.list_mode].findIndex(function(elem, index){
					if(elem.id == id && (elem.data == -1 || elem.data == data)) return true;
				});
				if(index >= 0){
					tile.data[tile.data.list_mode].splice(index, 1);
				}
				itemContainer.setSlot(slot, 0, 0, 0, null);
				return 0;
			}
		})
	},
	updateWindow: function(client){
		var _data = {
			name: this.networkData.getName() + '',
			list_mode: this.data.list_mode,
			ignore_item_data: this.data.ignore_item_data,
			updateFreq: this.data.updateFreq
		};
		if(client){
			if(typeof(client) == "number") client = Network.getClientForPlayer(client);
			this.container.sendEvent(client, "updateWindow", _data);
		} else {
			this.container.sendEvent("updateWindow", _data);
		}
	},
	destroy: function(){
		for(var i in this.container.slots){
			this.container.clearSlot(i);
		}
	},
	client: {
		tick: function(){
			if(this.networkData.getBoolean('update', false)){
				this.networkData.putBoolean('update', false);
				this.sendPacket("updateFreq", {updateFreq: this.networkData.getInt('updateFreq')})
			}
		},
		containerEvents: {
			updateWindow: function(container, window, content, eventData){
				wireGuiData.networkData = SyncedNetworkData.getClientSyncedData(eventData.name);
				content.elements["image_list_mode"].bitmap = 'wire_' + eventData.list_mode;
				content.elements["image_ignore_item_data"].bitmap = eventData.ignore_item_data ? 'item_data_ignore' : 'item_data_not_ignore';
				container.setText('text', Translation.translate("Update frequency (in ticks)") + " : " + eventData.updateFreq);
				wireGuiData.networkData.putInt('updateFreq', eventData.updateFreq);
				container.setScale('DellayScroll', eventData.updateFreq);
			}
		}
	},
    containerEvents: {
        'updateListMode': function(eventData, connectedClient) {
            this.update_list_mode(eventData.list_mode ? 'white_list' : 'black_list');
			this.updateWindow();
        },
        'updateIgnoreItemData': function(eventData, connectedClient) {
            this.data.ignore_item_data = !!eventData.ignore_item_data;
			this.updateWindow();
        }
	},
	events: {
		updateFreq: function(packetData, packetExtra, connectedClient) {
            this.data.updateFreq = packetData.updateFreq;
			var allClients = this.container.getNetworkEntity().getClients();
			var iterator = allClients.iterator();
			while(iterator.hasNext()){
				var client = iterator.next();
				if(client != connectedClient)this.updateWindow(client);
			}
		}
	}
})