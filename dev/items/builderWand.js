IDRegistry.genItemID("builderWand");
Item.createItem("builderWand", "Builder wand", {name: "builderWand"}, {stack: 1});
mod_tip(ItemID.builderWand);

Recipes.addShaped({id: ItemID.builderWand, count: 1, data: 0}, [
	" gg",
	" sg",
	"s  "
], ['s', 280, 0, 'g', 266, 0]);

var BWCoordsMap = [
	[1, 0, 1],
	[1, 0, 1],
	[1, 1, 0],
	[1, 1, 0],
	[0, 1, 1],
	[0, 1, 1]
];

var num_to_xyz = ['x','y','z'];
var builderWandBlockLimit = __config__.getNumber('builderWandBlockLimit');

function justFunc1(_coords, _side, _block){
	var temp_array = [];
	var blocksPlaced = 0;
	var gamemode = Game.getGameMode();
	var item;
	var itemCount = 0;
	if(gamemode != 1){
		item = searchItem(_block.id, _block.data);
		if(!item)return;
		itemCount = item.count + 0;
	}
	//Logger.Log('StartLine -----------------------------------------------------------------', 'UTILS+');
	function justFunc(array_of_coords, outcoords){
		var coords_array = [];
		for(var s in array_of_coords){
			var coords = array_of_coords[s];
			if(temp_array.indexOf(cts(coords)) != -1) continue
			temp_array.push(cts(coords));
			coords.relative = World.getRelativeCoords(coords.x, coords.y, coords.z, _side);
			var block1 = World.getBlock(coords.x, coords.y, coords.z);
			var blockOnThisCoords = World.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
			if(blocksPlaced >= builderWandBlockLimit || (gamemode != 1 && (!item || !item.count || itemCount <= 0))) return;
			if((blockOnThisCoords.id != 0 || !World.canTileBeReplaced(blockOnThisCoords.id, blockOnThisCoords.data)) || block1.id != _block.id || block1.data != _block.data) continue;
			blocksPlaced++;
			World.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, _block.id, _block.data);
			if(gamemode != 1){
				itemCount--;
				Player.setInventorySlot(item.slot, item.id, itemCount, item.data, item.extra);
				if(!item.count || itemCount <= 0){
					item = searchItem(_block.id, _block.data);
				}
			}
			var temp_coords = {};
			//Logger.Log('Coords map: ' + BWCoordsMap[_side], 'UTILS+');
			for(var i = 0; i < 3; i++){
				//Logger.Log('Call on ' + num_to_xyz[i] + ' side', 'UTILS+');
				if(BWCoordsMap[_side][i] == 0)continue;
				temp_coords.x = coords.x + 0;
				temp_coords.y = coords.y + 0;
				temp_coords.z = coords.z + 0;
				temp_coords[num_to_xyz[i]] = coords[num_to_xyz[i]] + BWCoordsMap[_side][i];
				coords_array.push(Object.assign({}, temp_coords));
				temp_coords[num_to_xyz[i]] = coords[num_to_xyz[i]] - BWCoordsMap[_side][i];
				coords_array.push(Object.assign({}, temp_coords));
			}
		}
		//Logger.Log('searching: ' + JSON.stringify(coords_array), 'UTILS+');
		if(coords_array.length == 0) return;
		justFunc(coords_array);
	}
	justFunc([_coords]);
}

Item.registerUseFunction("builderWand", function(coords, item, block){
	justFunc1(coords, coords.side, block);
});