var groups = {
	last: 0
};
var ignored = {}

IDRegistry.genBlockID("utilsWire");
Block.createBlock("utilsWire", [{
	name: "Pipe",
	texture: [
		["utilsWire", 0]
	],
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

var blacklist = {};

Saver.addSavesScope("UtilsWire",
	function read(scope) {
		if (typeof (scope) != 'object') groups = JSON.parse(scope);
		if (!groups || typeof (scope) == 'object') {
			groups = {
				last: 0
			};
		}
	},
	function save() {
		return JSON.stringify(groups);
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

Callback.addCallback("LevelDisplayed", function () {
	for (var i in groups) {
		if (i == 'last') continue;
		var splited = i.split(",");
		var coords = {
			x: splited[0],
			y: splited[1],
			z: splited[2]
		};
		if (groups[i].not) {
			for (var d in groups[i].not) {
				ICRender.getGroup("not" + coords.x + "," + coords.y + "," + coords.z + ":" + groups[i].not[d].x + "," + groups[i].not[d].y + "," + groups[i].not[d].z + "utilsWire").add(World.getBlock(groups[i].not[d].x, groups[i].not[d].y, groups[i].not[d].z).id, -1);
			}
		};
		mapGetter(coords, groups[i].i, groups[i].meta, true);
	}
});

Callback.addCallback("LevelLeft", function () {
	groups = { last: 0 };
});

function utilsItemGetter_func(coords){
	Game.prevent();
	var relBlock = World.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
	if (relBlock.id != 0 && relBlock.id != 9 && relBlock.id != 11) return;
	blockData = getDataOnSide(coords.side);
	World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, BlockID.utilsItemGetter, blockData);
	Player.decreaseCarriedItem(1);
	World.addTileEntity(coords.relative.x, coords.relative.y, coords.relative.z);
	groups.last++;
	groups[coords.relative.x + "," + coords.relative.y + "," + coords.relative.z] = {
		i: groups.last,
		meta: blockData
	};
	mapGetter(coords.relative, groups.last, blockData);
}

function utilsWire_func(coords){
	Game.prevent();
	var relBlock = World.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
	if (relBlock.id != 0 && relBlock.id != 9 && relBlock.id != 11) return;
	World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, BlockID.utilsWire, 0);
	Player.decreaseCarriedItem(1);
	groups.last++;
	groups[coords.relative.x + "," + coords.relative.y + "," + coords.relative.z] = {
		i: groups.last
	};
	mapGetter(coords.relative, groups.last);
}

Block.registerPlaceFunction('utilsItemGetter', utilsItemGetter_func);
Block.registerPlaceFunction('utilsWire', utilsWire_func);

if(InnerCore_pack.packVersionCode >= 58){
	Block.registerDropFunction("utilsWire", function (coords, id, data, diggingLevel, toolLevel) {
		delete groups[coords.x + "," + coords.y + "," + coords.z];
		BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
		return [[BlockID.utilsWire, 1, 0]];
	});
	Block.registerDropFunction("utilsItemGetter", function (coords, id, data, diggingLevel, toolLevel) {
		delete groups[coords.x + "," + coords.y + "," + coords.z];
		BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
		return [[BlockID.utilsItemGetter, 1, 2]];
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
} else {
	Item.registerUseFunction("utilsItemGetter_item", utilsItemGetter_func);
	Item.registerUseFunction("utilsWire_item", utilsWire_func);
	Block.registerDropFunction("utilsWire", function (coords, id, data, diggingLevel, toolLevel) {
		delete groups[coords.x + "," + coords.y + "," + coords.z];
		BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
		return [[ItemID.utilsWire_item, 1, 0]];
	});
	Block.registerDropFunction("utilsItemGetter", function (coords, id, data, diggingLevel, toolLevel) {
		delete groups[coords.x + "," + coords.y + "," + coords.z];
		BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
		return [[ItemID.utilsItemGetter_item, 1, 0]];
	});
	IDRegistry.genItemID("utilsWire_item");
	Item.createItem("utilsWire_item", "Item pipe", {
		name: "pipe_item"
	}, {
		stack: 64
	});
	mod_tip(ItemID.utilsWire_item);
	Recipes.addShaped({
		id: ItemID.utilsWire_item,
		count: 16,
		data: 0
	}, [
		"sss",
		"iii",
		"sss"
	], ['i', 265, 0, 's', 1, 0]);

	IDRegistry.genItemID("utilsItemGetter_item");
	Item.createItem("utilsItemGetter_item", "Extraction pipe", {
		name: "Epipe_item"
	}, {
		stack: 64
	});
	mod_tip(ItemID.utilsItemGetter_item);
	Recipes.addShaped({
		id: ItemID.utilsItemGetter_item,
		count: 1,
		data: 0
	}, [
		"ssi",
		"iih",
		"ssi"
	], ['i', 265, 0, 's', 1, 0, 'h', 410, 0]);
}


const width = 0.1875;
const centerWidth = 0.3125;

(function () {

	var group = ICRender.getGroup("utilsWire");
	group.add(BlockID.utilsItemGetter, -1);
	group.add(BlockID.utilsWire, -1);

	var boxes = [
		[
			[0.2, 0.2, 0, 0.8, 0.8, 0.03] //left
		],
		[
			[0.8, 0.8, 0.97, 0.2, 0.2, 1] //right
		],
		[
			[0.97, 0.8, 0.8, 1, 0.2, 0.2] //forward
		],
		[
			[0, 0.2, 0.2, 0.03, 0.8, 0.8] //back
		],
		[
			[0.8, 0.97, 0.8, 0.2, 1, 0.2] //up
		],
		[
			[0.2, 0, 0.2, 0.8, 0.03, 0.8] //down
		]
	];

	var boxesWire = [
		[0.5 - width / 2, 0.5 - width / 2, 0, 0.5 + width / 2, 0.5 + width / 2, 0.5 - width / 2], //left
		[0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, 1], //right
		[0.5 + width / 2, 0.5 - width / 2, 0.5 - width / 2, 1, 0.5 + width / 2, 0.5 + width / 2], //forward
		[0, 0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2], //back
		[0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2, 1, 0.5 + width / 2], //up
		[0.5 - width / 2, 0, 0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2] //down
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
		  model.addBox(box[0], box[1], box[2], box[3], box[4], box[5], "quartz_block_side", 0);
		  //render.addEntry(model);
	  }
		model.addBox(wire[0], wire[1], wire[2], wire[3], wire[4], wire[5], BlockID.utilsWire, 0);
		model.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, BlockID.utilsWire, 0);
		render.addEntry(model);

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
		},
		]
		var entry = Dmodel.addEntry();
		entry.addBox(0.2, 0.2, 0.2, 0.8, 0.8, 0.8);
		BlockRenderer.setCustomCollisionShape(BlockID.utilsItemGetter, meta, Dmodel)
		BlockRenderer.enableCoordMapping(BlockID.utilsItemGetter, meta, render);
	}
	var Dmodel = new ICRender.CollisionShape();
	var render = new ICRender.Model();
	var model = BlockRenderer.createModel();
	model.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, BlockID.utilsWire, 0);
	render.addEntry(model);
	var entry = Dmodel.addEntry();
	entry.addBox(0.2, 0.2, 0.2, 0.8, 0.8, 0.8);
	BlockRenderer.setCustomCollisionShape(BlockID.utilsWire, -1, Dmodel);
	BlockRenderer.enableCoordMapping(BlockID.utilsWire, -1, render);
})()

function mapGetter(coords, i, meta, atach) {
	coords.x = Number(coords.x);
	coords.y = Number(coords.y);
	coords.z = Number(coords.z);

	var boxes = [
		[
			[0.2, 0.2, 0, 0.8, 0.8, 0.03] //left
		],
		[
			[0.8, 0.8, 0.97, 0.2, 0.2, 1] //right
		],
		[
			[0.97, 0.8, 0.8, 1, 0.2, 0.2] //forward
		],
		[
			[0, 0.2, 0.2, 0.03, 0.8, 0.8] //back
		],
		[
			[0.8, 0.97, 0.8, 0.2, 1, 0.2] //up
		],
		[
			[0.2, 0, 0.2, 0.8, 0.03, 0.8] //down
		]
	];

	var boxesWire = [
		[0.5 - width / 2, 0.5 - width / 2, 0, 0.5 + width / 2, 0.5 + width / 2, 0.5 - width / 2], //left
		[0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2, 0.5 + width / 2, 1], //right
		[0.5 + width / 2, 0.5 - width / 2, 0.5 - width / 2, 1, 0.5 + width / 2, 0.5 + width / 2], //forward
		[0, 0.5 - width / 2, 0.5 - width / 2, 0.5 - width / 2, 0.5 + width / 2, 0.5 + width / 2], //back
		[0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2, 1, 0.5 + width / 2], //up
		[0.5 - width / 2, 0, 0.5 - width / 2, 0.5 + width / 2, 0.5 - width / 2, 0.5 + width / 2] //down
	];

	var boxe = [];
	if (meta >= 0) {
		boxe = boxes[meta];
		var wire = boxesWire[meta]
	}

	var render = new ICRender.Model();

 for (var n in boxe) {
		var box = boxe[n];
		var model = BlockRenderer.createModel();

		model.addBox(box[0], box[1], box[2], box[3], box[4], box[5], "quartz_block_side", 0);
		render.addEntry(model);
	}
	var model = BlockRenderer.createModel();
	if (meta >= 0) model.addBox(wire[0], wire[1], wire[2], wire[3], wire[4], wire[5], BlockID.utilsWire, 0);
	model.addBox(0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 - centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, 0.5 + centerWidth / 2, BlockID.utilsWire, 0);
	render.addEntry(model);

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
	},
	]
	for (var l in boxes1) {
		var box = boxes1[l];
		var blockg = groups[(coords.x + box.side[0]) + "," + (coords.y + box.side[1]) + "," + (coords.z + box.side[2])];
		if (!atach && blockg) {
			BlockRenderer.unmapAtCoords(coords.x + box.side[0], coords.y + box.side[1], coords.z + box.side[2]);
			var crds = {
				x: coords.x + box.side[0],
				y: coords.y + box.side[1],
				z: coords.z + box.side[2]
			}
			mapGetter(crds, blockg.i, blockg.meta, true)
		}
		var model = BlockRenderer.createModel();
		model.addBox(box.box[0], box.box[1], box.box[2], box.box[3], box.box[4], box.box[5], BlockID.utilsWire, 0);
		var gp = "not" + coords.x + "," + coords.y + "," + coords.z + ":" + (coords.x + box.side[0]) + "," + (coords.y + box.side[1]) + "," + (coords.z + box.side[2]) + "utilsWire";
		//var gp2 = "not" + (coords.x + box.side[0]) + "," + (coords.y + box.side[1]) + "," + (coords.z + box.side[2]) + ":" + coords.x + "," + coords.y + "," + coords.z + "utilsWire";
		render.addEntry(model).setCondition(ICRender.AND(ICRender.BLOCK(box.side[0], box.side[1], box.side[2], ICRender.getGroup(gp + (ignored[gp] >= 0 ? ignored[gp] : '')), true), ICRender.BLOCK(box.side[0], box.side[1], box.side[2], ICRender.getGroup("utilsWire"), false)));
	}
	BlockRenderer.mapAtCoords(coords.x, coords.y, coords.z, render);
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
	}
	]

	return retCoords[blockData];
}

Callback.addCallback("BuildBlock", function (coords, block, entity) {
	var coordss = {};
	for (var i in sides) {
		coordss.x = coords.x + sides[i][0]
		coordss.y = coords.y + sides[i][1]
		coordss.z = coords.z + sides[i][2]
		var bck = World.getBlock(coordss.x, coordss.y, coordss.z);
		if (bck.id == BlockID.utilsWire || bck.id == BlockID.utilsItemGetter) {
			searchContainers(coordss, coordss)
		}
	}
});

function searchContainers(coordsf, outCoordsf) {
	var containers = [];
	var outCoords = [];
	var started = [];
	function asdds(coords) {
		if (started.indexOf(cts(coords)) != -1) return;
		started.push(cts(coords));
		var tc;
		var bon_wires = [];
		for (var i in sides) {
			var coordss = {};
			var bonus;

			coordss.x = coords.x + sides[i][0];
			coordss.y = coords.y + sides[i][1];
			coordss.z = coords.z + sides[i][2];
			if (World.getBlock(coords.x, coords.y, coords.z).id == BlockID.utilsItemGetter && World.getTileEntity(coords.x, coords.y, coords.z)) bonus = World.getTileEntity(coords.x, coords.y, coords.z).data.target;
			var not = false;
			if (groups && groups[cts(coords)] && groups[cts(coords)].not && groups[cts(coords)].not.map(function (d) {
				return d.x + ',' + d.y + ',' + d.z
			}).indexOf(cts(coordss)) != -1) not = true;
			if (outCoords.indexOf(cts(coordss)) == -1 && cts(coordss) != cts(bonus) && !not) {
				var cont = World.getContainer(coordss.x, coordss.y, coordss.z);
				var tile = World.addTileEntity(coordss.x, coordss.y, coordss.z) || World.getTileEntity(coordss.x, coordss.y, coordss.z);
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
					} else if (tile && tile.getTransportSlots && tile.getTransportSlots().input) {
						//devLog("Mod tile");
						tc.type = "modded";
						tc.TileEntity = tile;
						if (tc.TileEntity.interface) tc.SI = true;
						tc.slots = tile.getTransportSlots().input;
						if (tc.SI) {
							tc.slots = [];
							for (let name in tc.TileEntity.interface.slots) {
								let slotData = tc.TileEntity.interface.slots[name];
								if (slotData.input) tc.slots.push(name);
							}
						}
						tc.size = tc.slots.length;
					} else if (tile && !tile.getTransportSlots) {
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
						var id = World.getBlock(coordss.x, coordss.y, coordss.z).id
						if (id > 0) ICRender.getGroup("utilsWire").add(id, -1);
					}
					containers.push(tc);
					tc = false;
				}
				var block = World.getBlock(coordss.x, coordss.y, coordss.z);
				if (block.id == BlockID.utilsWire || block.id == BlockID.utilsItemGetter) {
					//outCoords.push(cts(coords));
					//asdds(coordss);
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

/*Callback.addCallback('tick', function () {
	Game.tipMessage(cts(getPointed().pos));
});*/

function targetIsContainer(coords, _item_data) {
	var tc = false;
	var coordss = coords;
	var __container = World.getContainer(coordss.x, coordss.y, coordss.z)
	var __tileentity = World.addTileEntity(coordss.x, coordss.y, coordss.z) || World.getTileEntity(coordss.x, coordss.y, coordss.z);
	if (__container) {
		//devLog("target found");
		tc = {
			container: __container,
			type: "vanilla",
			side: getSideOnData(_item_data)
		};
		if (!__tileentity) {
			//devLog("target vanilla tile");
			tc.size = __container.size;
			tc.slots = [];
			for (var k = 0; k < tc.size; k++) {
				tc.slots.push(k);
			}
		} else if (__tileentity && __tileentity.getTransportSlots && __tileentity.getTransportSlots().output) {
			//devLog("target mod tile");
			tc.type = "modded";
			tc.TileEntity = __tileentity;
			if (tc.TileEntity.interface) tc.SI = true;
			tc.slots = __tileentity.getTransportSlots().output;
			if (tc.SI) tc.slots = tc.TileEntity.interface.getOutputSlots(tc.side);
			tc.size = tc.slots.length;
		} else if (__tileentity && !__tileentity.getTransportSlots) {
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
				devLog('cont: ' + cont);
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
	devLog("pay");
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
	var target = targetIsContainer(this.data.target, this.data.blockData);
	if (!target) return;//devLog("!target");
	var containers = searchContainers(this, this.data.target);
	if (containers.length == 0) return;// devLog("no containers");
	var exportSlot = searchExportSlot(target, this);
	if (exportSlot == 'not found') return;//devLog("export slot not found");
	var importData = searchImportSlot(containers, target.container.getSlot(exportSlot));
	if (!importData) return;//devLog("no import slot");
	pay(target.container, importData.container, exportSlot, importData.slot, target.container.getSlot(exportSlot));
}

var wireGUI_elements = {};
function init_wireGUI_elements(){
	wireGUI_elements["DellayScroll"] = {
		type: "scroll",
		x: 100 + 225,
		y: 200,
		length: 800 - 225,
		min: 5,
		max: 120,
		isInt: true,
		value: 0,
		onNewValue: function (value, container, element) {
			var container = element.window.getContainer();
			if(container){
				var tile = container.tileEntity;
				tile.data.updateFreq = value;
				container.setText('text', Translation.translate("Update frequency (in ticks)") + " : " + tile.data.updateFreq);
			}
		}
	},
	wireGUI_elements["text"] = {
		type: "text",
		x: 440,
		y: 150,
		font: {
			color: android.graphics.Color.DKGRAY
		},
		text: "Частота обновления (в тиках) : 0"
	},
	wireGUI_elements["text2"] = {
		type: "text",
		x: 1000 - 225,
		y: 30,
		font: {
			color: android.graphics.Color.DKGRAY,
			//shadow: 0.5,
			size: 15
		},
		text: Translation.translate("1 second = 20 ticks")
	}
	var slot_size = 60;
	var slots_count = 20;
	for(var i = 0; i < slots_count; i++){
		wireGUI_elements['slot'+i] = {
			id: i,
			type: "slot",
			x: 350 + slot_size*(i % (slots_count/2)),
			y: 300 + slot_size*Math.floor(i/(slots_count/2)),
			z: 100,
			size: slot_size,
			onTouchEvent: function (element, event) {
				if (event.type == 'CLICK') {
					var slot_id = 'slot' + this.id;
					var container = element.window.getContainer();
					var tile = container.tileEntity;
					var item = container.getSlot(slot_id);
					if(item.id == 0) return;
					var index = tile.data[tile.data.list_mode].findIndex(function(elem, index){
						if(elem.id == item.id && (elem.data == -1 || elem.data == item.data)) return true;
					});
					if(index >= 0){
						tile.data[tile.data.list_mode].splice(index, 1);
					}
					container.setSlot(slot_id, 0, 0, 0);
					this.visual = false;
				}
			}
		}
	}

	var filter_cons = 10;
	var image_cons = 5;
	wireGUI_elements["list_mode"] = {
		type: "button",
		x: 0,
		y: wireGUI_elements['slot0'].y,
		bitmap: 'RS_empty_button',
		bitmap2: 'RS_empty_button_pressed',
		scale: (slot_size*2 - filter_cons)/2/24,
		clicker: {
			onClick: function (position, container, tileEntity, window, canvas, scale) {
				if (tileEntity.data.list_mode == 'black_list') {
					tileEntity.update_list_mode('white_list');
					wireGUI_elements["image_list_mode"].bitmap = 'wire_white_list';
				} else {
					tileEntity.update_list_mode('black_list');
					wireGUI_elements["image_list_mode"].bitmap = 'wire_black_list';
				}
			},
			onLongClick: function (position, container, tileEntity, window, canvas, scale) {
				
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
	wireGUI_elements["image_list_mode"].scale = (20*wireGUI_elements["list_mode"].scale - image_cons)/30;
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
			onClick: function (position, container, tileEntity, window, canvas, scale) {
				tileEntity.data.ignore_item_data = !tileEntity.data.ignore_item_data;
				if (tileEntity.data.ignore_item_data) {
					wireGUI_elements["image_ignore_item_data"].bitmap = 'item_data_ignore';
				} else {
					wireGUI_elements["image_ignore_item_data"].bitmap = 'item_data_not_ignore';
				}
			},
			onLongClick: function (position, container, tileEntity, window, canvas, scale) {
				
			}
		}
	}

	wireGUI_elements["image_ignore_item_data"] = {
		type: "image",
		x: 0,
		y: 0,
		z: 1000,
		bitmap: "item_data_not_ignore",
		scale: 0,
	}
	wireGUI_elements["image_ignore_item_data"].scale = (20*wireGUI_elements["ignore_item_data"].scale - image_cons)/24;
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
})

var ja = false;
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
	click: function () {
		if (wrenches.indexOf(Player.getCarriedItem().id) != -1 || Entity.getSneaking(Player.get())) return false;
		if(!this.container.isOpened())this.container.openAs(wireGUI);
		var content = this.container.getGuiContent();
		var tile = this;
		for(var i = 0; i < 20; i++){
			content.elements['slot'+i].isValid = function (id, count, data) {
				var slot_id = 'slot' + this.id;
				if (id == 0 || tile.container.getSlot(slot_id).id != 0) return false;
				tile.data[tile.data.list_mode].push({id: id, data: data});
				tile.container.setSlot(slot_id, id, 1, data);
				this.visual = true;
				return false;
			}
			if(this.container.getSlot('slot'+i).id != 0)
				content.elements['slot'+i].visual = true;
			else
				content.elements['slot'+i].visual = false;
		}
		content.elements.DellayScroll.value = this.data.updateFreq;
		this.container.setScale('DellayScroll', this.data.updateFreq);
		content.elements.text.text = Translation.translate("Update frequency (in ticks)") + " : " + this.data.updateFreq;
		content.elements.text2.text = Translation.translate("1 second = 20 ticks");
		if (this.data.ignore_item_data) {
			content.elements["image_ignore_item_data"].bitmap = 'item_data_ignore';
		} else {
			content.elements["image_ignore_item_data"].bitmap = 'item_data_not_ignore';
		}
		content.elements["image_list_mode"].bitmap = 'wire_' + this.data.list_mode;
		return true;
	},
	created: function () {
		this.data.blockData = World.getBlock(this.x, this.y, this.z).data;
		this.data.target = coordsOnBlockData(this.data.blockData, this);
	},
	update_list_mode: function(mode){
		if(mode == 'white_list'){
			this.data.white_list = [].concat(this.data.black_list);
			this.data.black_list = [];
		} else {
			this.data.black_list = [].concat(this.data.white_list);
			this.data.white_list = [];
		}
		this.data.list_mode = mode;
	},
	tick: function () {
		this.data.ticks++;
		if (this.data.ticks >= this.data.updateFreq) {
			this.data.ticks = 0;
			apply.apply(this);
			/*try {
				apply.apply(this);
			} catch (err) {
				devLog(err);
			};*/
		}
	},
	init: function () {
		if (!this.data.target) this.created();
		if (!this.data.black_list)this.data.black_list = [];
		if (!this.data.white_list)this.data.white_list = [];
		searchContainers(this, this.data.target);
		this.data.updateFreq = Math.max(5, Math.min(this.data.updateFreq, 120));
	},
	destroy: function(){
		this.container.slots = {};
	}
})