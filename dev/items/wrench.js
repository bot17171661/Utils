IDRegistry.genItemID("utilsWrench");
Item.createItem("utilsWrench", "Wrench", {
	name: "wrench"
}, {
	stack: 1
});
mod_tip(ItemID.utilsWrench);

Recipes.addShaped({
	id: ItemID.utilsWrench,
	count: 1,
	data: 0
}, [
	"i i",
	"iii",
	" i "
], ['i', 265, 0]);

var wrenches = [ItemID.utilsWrench];

ModAPI.addAPICallback("ICore", function(api) {
	wrenches.push(ItemID.wrenchBronze);
});

Callback.addCallback("ItemUse", function (coords, item, _block, param1, player) {
	if ((_block.id == BlockID.utilsWire || _block.id == BlockID.utilsItemGetter) && wrenches.indexOf(item.id) != -1) {
		var touchCoords = coords.vec;
		for(var i in touchCoords){
			var absValue = Math.abs(touchCoords[i])
			touchCoords[i] = absValue - parseInt(absValue);
		}
		var side = null;
		for(var i in clickBoxes){
			var box = clickBoxes[i].box;
			if(touchCoords.x >= box[0] && touchCoords.x <= box[3] && touchCoords.y >= box[1] && touchCoords.y <= box[4] && touchCoords.z >= box[2] && touchCoords.z <= box[5]){
				side = clickBoxes[i].side;
				break;
			}
		}
		var blockSource = BlockSource.getDefaultForActor(player);
		var selectedWire = coords;
		var coords = World.getRelativeCoords(coords.x, coords.y, coords.z, side);
		var block = blockSource.getBlock(coords.x, coords.y, coords.z);
		if (block.id == 0 || side == null) return;
		var currentDimension = blockSource.getDimension();
		var idcurrentDimension = 'd' + currentDimension;
		if(!allGroups[idcurrentDimension]) allGroups[idcurrentDimension] = {};
		var groups = allGroups[idcurrentDimension];
		var updateGroup = {};
		if(!regionGroups[idcurrentDimension]) regionGroups[idcurrentDimension] = {};
		var sel = selectedWire.x + "," + selectedWire.y + "," + selectedWire.z;
		var crds = coords.x + "," + coords.y + "," + coords.z;
		var regionCentreCoords = calculateCentre(selectedWire);
		var string_regionCentreCoords = cts(regionCentreCoords);
		var _regionGroups = regionGroups[idcurrentDimension][string_regionCentreCoords];
		if(!networkTiles[idcurrentDimension])networkTiles[idcurrentDimension] = {};
		if(!(_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords])){
			_networkTile = networkTiles[idcurrentDimension][string_regionCentreCoords] = new NetworkEntity(wireNetworkEntityType, createTargetData(regionCentreCoords, blockSource));
		}
		if (!groups[sel]) return tipMessage(player, "§aERROR");
		if (groups[sel].not) groups_sel = groups[sel].not.map(function(d) {
			return d.x + ',' + d.y + ',' + d.z
		});
		if (groups[crds] && groups[crds].not) groups_crds = groups[crds].not.map(function(d) {
			return d.x + ',' + d.y + ',' + d.z
		});
		var a = groups[sel].not && groups[sel].not.length > 0 && groups_sel.indexOf(crds) != -1;
		var b = groups[crds] && groups[crds].not && groups[crds].not.length > 0 && groups_crds.indexOf(sel) != -1;
		var not_sel_string = 'not' + sel + ':' + crds + 'utilsWire' + currentDimension;
		var not_crds_string = 'not' + crds + ':' + sel + 'utilsWire' + currentDimension;
		if (a || b) {
			if (a) {
				groups[sel].not.splice(groups_sel.indexOf(crds), 1);
				ignored[not_sel_string] = ignored[not_sel_string] >= 0 ? ignored[not_sel_string] + 1 : 0;
				mapGetter(selectedWire, groups[sel].meta, groups, true, blockSource);
				updateGroup[sel] = _regionGroups[sel] = groups[sel];
				if(groups[crds])updateGroup[crds] = _regionGroups[crds] = groups[crds];
				_networkTile.send("updateBlock", {coords: selectedWire, meta: groups[sel].meta, updateGroup: updateGroup, ignored:ignored});
			};
			if (b) {
				groups[crds].not.splice(groups_crds.indexOf(sel), 1);
				ignored[not_crds_string] = ignored[not_crds_string] >= 0 ? ignored[not_crds_string] + 1 : 0;
				mapGetter(coords, groups[crds].meta, groups, true, blockSource);
				updateGroup[sel] = _regionGroups[sel] = groups[sel];
				if(groups[crds])updateGroup[crds] = _regionGroups[crds] = groups[crds];
				_networkTile.send("updateBlock", {coords: selectedWire, meta: groups[sel].meta, updateGroup: updateGroup, ignored:ignored});
			};
		} else {
			var groupAdd = [];
			if (groups[sel].not) {
				groups[sel].not.push({
					x: coords.x,
					y: coords.y,
					z: coords.z
				});
			} else {
				groups[sel].not = [{
					x: coords.x,
					y: coords.y,
					z: coords.z
				}];
			}
			groupAdd.push([not_sel_string + (ignored[not_sel_string] >= 0 ? ignored[not_sel_string] : ''), block.id]);
			if ((block.id == BlockID.utilsWire || block.id == BlockID.utilsItemGetter) && groups[crds]) {
				if (groups[crds].not) {
					groups[crds].not.push({
						x: selectedWire.x,
						y: selectedWire.y,
						z: selectedWire.z
					});
				} else {
					groups[crds].not = [{
						x: selectedWire.x,
						y: selectedWire.y,
						z: selectedWire.z
					}];
				}
				groupAdd.push([not_crds_string + (ignored[not_crds_string] >= 0 ? ignored[not_crds_string] : ''), _block.id]);
			}
			mapGetter(selectedWire, groups[sel].meta, groups, true, blockSource);
			updateGroup[sel] = _regionGroups[sel] = groups[sel];
			if(groups[crds])updateGroup[crds] = _regionGroups[crds] = groups[crds];
			_networkTile.send("updateBlock", {groupAdd: groupAdd, coords: selectedWire, meta: groups[sel].meta, updateGroup: updateGroup, ignored:ignored});
		}
	}
});