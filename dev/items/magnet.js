IDRegistry.genItemID("magnet");
Item.createItem("magnet", "Magnet", {
	name: "magnet"
}, {
	stack: 1
});
mod_tip(ItemID.magnet);
/* IDRegistry.genItemID("enabled_magnet");
Item.createItem("enabled_magnet", "Magnet", {
	name: "magnet"
}, {
	stack: 1
});
mod_tip(ItemID.enabled_magnet);
Item.setGlint('enabled_magnet', true); */
Recipes.addShaped({
	id: ItemID.magnet,
	count: 1,
	data: 0
}, [
	"iir",
	"  i",
	"iib"
], ['i', 265, 0, 'r', 35, 14, 'b', 35, 11]);

/* ModAPI.addAPICallback("BaublesAPI", function(api) {
	Baubles = api.Baubles;
	api.Baubles.registerBauble({
		id: ItemID.magnet,
		type: "ring",
		onEquip: function() {
			baubleEquipMagnet = true;
			baubleDescMagnet = api.Baubles.getDesc(ItemID.magnet);
		},
		onTakeOff: function() {
			baubleEquipMagnet = false;
			baubleDescMagnet = false;
		}
	});
}) */

Item.registerUseFunction("magnet", function(coords, item, block, player) {
	var _playerActor = new PlayerActor(player);
	var selectedSlot = _playerActor.getSelectedSlot();
	var extra = item.extra || new ItemExtraData();
	if (extra.getBoolean('active', false)) {
		Game.tipMessage(Native.Color.GREEN + 'Power: ' + Native.Color.WHITE + 'Off');
		extra.removeEnchant(-134);
		extra.putBoolean('active', false);
		_playerActor.setInventorySlot(selectedSlot, ItemID.magnet, 1, 0, extra);
	} else {
		Game.tipMessage(Native.Color.GREEN + 'Power: ' + Native.Color.WHITE + 'On');
		extra.addEnchant(-134, 0);
		extra.putBoolean('active', true);
		_playerActor.setInventorySlot(selectedSlot, ItemID.magnet, 1, 0, extra);
	}
});

Callback.addCallback("tick", function() {
	if (World.getThreadTime()%10 == 0) {
		for(var i in _players){
			var _player = _players[i];
			var item = searchItem(ItemID.magnet, -1, false, false, _player);
			if (item) {
				var extra = item.extra || new ItemExtraData();
				if (extra.getBoolean("active", false)) {
					var position = Entity.getPosition(_player);
					var entity = Entity.getAllInRange(position, 15, 64);
					for (var k in entity) {
						if(!entity[k]) continue;
						Entity.moveToTarget(entity[k], position, {
							speed: 0.5,
							denyY: false,
							jumpVel: 0.5
						})
					}
				}
			}
		}
	}
});