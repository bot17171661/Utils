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

var render = new Render({
	skin: "wire.png"
});
render.setPart("body", [{
		type: "box",
		coords: {
			x: 8,
			y: 8,
			z: 0
		},
		size: {
			x: 16,
			y: 1,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 0,
			y: 8,
			z: -8
		},
		size: {
			x: 1,
			y: 1,
			z: 16
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 0,
			y: 16,
			z: 0
		},
		size: {
			x: 1,
			y: 16,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 8,
			y: 8,
			z: -16
		},
		size: {
			x: 16,
			y: 1,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 16,
			y: 8,
			z: -8
		},
		size: {
			x: 1,
			y: 1,
			z: 16
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 16,
			y: 16,
			z: -16
		},
		size: {
			x: 1,
			y: 16,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 16,
			y: 16,
			z: 0
		},
		size: {
			x: 1,
			y: 16,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 0,
			y: 16,
			z: -16
		},
		size: {
			x: 1,
			y: 16,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 8,
			y: 24,
			z: 0
		},
		size: {
			x: 16,
			y: 1,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 8,
			y: 24,
			z: -16
		},
		size: {
			x: 16,
			y: 1,
			z: 1
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 0,
			y: 24,
			z: -8
		},
		size: {
			x: 1,
			y: 1,
			z: 16
		},
		uv: {
			x: 20,
			y: 20
		}
	},
	{
		type: "box",
		coords: {
			x: 16,
			y: 24,
			z: -8
		},
		size: {
			x: 1,
			y: 1,
			z: 16
		},
		uv: {
			x: 20,
			y: 20
		}
	}
], {})

var animationRED = new Animation.Base(0, 0, 0);
animationRED.describe({
	render: render.getId()
});

var selectedWire = {
	x: 0,
	y: 0,
	z: 0,
	selected: false
};

Callback.addCallback("ItemUse", function (coords, item, block) {
	if (wrenches.indexOf(item.id) != -1) {
		//devLog('blockID: ' + block.id);
		if (block.id == 0) return;
		//Game.prevent();
		if (Entity.getSneaking(Player.get()) && (block.id == BlockID.utilsWire || block.id == BlockID.utilsItemGetter)) {
			//devLog('block selected');
			if (selectedWire.selected) animationRED.destroy();
			selectedWire.x = coords.x;
			selectedWire.y = coords.y;
			selectedWire.z = coords.z;
			selectedWire.selected = true;
			animationRED.setPos(coords.x, coords.y, coords.z);
			animationRED.load();
			return;
		} else if (selectedWire.selected) {
			//devLog('search target');
			if (Math.sqrt(Math.pow(coords.x - selectedWire.x, 2) + Math.pow(coords.y - selectedWire.y, 2) + Math.pow(coords.z - selectedWire.z, 2)) != 1) {
				//devLog('target is selector or target is far ER... ER... ER... ER...')
				selectedWire.selected = false;
				animationRED.destroy();
				return;
			}
			var sel = selectedWire.x + "," + selectedWire.y + "," + selectedWire.z;
			//devLog('sel: ' + sel);
			var crds = coords.x + "," + coords.y + "," + coords.z;
			//devLog('crds: ' + crds);
			if (!groups[sel]) return Game.tipMessage("§aERROR");
			if (groups[sel].not) groups_sel = groups[sel].not.map(function(d) {
				return d.x + ',' + d.y + ',' + d.z
			});
			if (groups[crds] && groups[crds].not) groups_crds = groups[crds].not.map(function(d) {
				return d.x + ',' + d.y + ',' + d.z
			});
			var a = groups[sel].not && groups[sel].not.length > 0 && groups_sel.indexOf(crds) != -1;
			var b = groups[crds] && groups[crds].not && groups[crds].not.length > 0 && groups_crds.indexOf(sel) != -1;
			if (a || b) {
				if (a) {
					//devLog('target must be destroyed')
					groups[sel].not.splice(groups_sel.indexOf(crds), 1);
					ignored['not' + sel + ':' + crds + 'utilsWire'] = ignored['not' + sel + ':' + crds + 'utilsWire'] >= 0 ? ignored['not' + sel + ':' + crds + 'utilsWire'] + 1 : 0;
					BlockRenderer.unmapAtCoords(selectedWire.x, selectedWire.y, selectedWire.z);
					mapGetter(selectedWire, groups[sel].i, groups[sel].meta);
					//devLog('target destroyed')
				};
				if (b) {
					//devLog('target must be destroyed')
					groups[crds].not.splice(groups_crds.indexOf(sel), 1);
					ignored['not' + crds + ':' + sel + 'utilsWire'] = ignored['not' + crds + ':' + sel + 'utilsWire'] >= 0 ? ignored['not' + crds + ':' + sel + 'utilsWire'] + 1 : 0;
					BlockRenderer.unmapAtCoords(coords.x, coords.y, coords.z);
					mapGetter(coords, groups[crds].i, groups[crds].meta);
					//devLog('target destroyed')
				};
			} else {
				//devLog('target must be added')
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
				ICRender.getGroup('not' + sel + ':' + crds + 'utilsWire' + (ignored['not' + sel + ':' + crds + 'utilsWire'] >= 0 ? ignored['not' + sel + ':' + crds + 'utilsWire'] : '')).add(block.id, -1);
				if (block.id == BlockID.utilsWire || block.id == BlockID.utilsItemGetter) {
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
					ICRender.getGroup('not' + crds + ':' + sel + 'utilsWire' + (ignored['not' + crds + ':' + sel + 'utilsWire'] >= 0 ? ignored['not' + crds + ':' + sel + 'utilsWire'] : '')).add(World.getBlock(selectedWire.x, selectedWire.y, selectedWire.z).id, -1);
				}
				BlockRenderer.unmapAtCoords(selectedWire.x, selectedWire.y, selectedWire.z);
				mapGetter(selectedWire, groups[sel].i, groups[sel].meta)
				//devLog('target added')
			}
		}
	}
});