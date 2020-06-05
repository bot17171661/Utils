IDRegistry.genItemID("magnet");
Item.createItem("magnet", "Magnet", {
	name: "magnet"
}, {
	stack: 1
});
mod_tip(ItemID.magnet);
Recipes.addShaped({
	id: ItemID.magnet,
	count: 1,
	data: 0
}, [
	"iir",
	"  i",
	"iib"
], ['i', 265, 0, 'r', 35, 14, 'b', 35, 11]);

var baubleEquipMagnet = false;
var baubleDescMagnet = false;
var Baubles = false;;

ModAPI.addAPICallback("BaublesAPI", function(api) {
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
})

Item.registerUseFunction("magnet", function(coords, item, block) {
	var extra = new ItemExtraData(Player.getCarriedItem().extra);
	if (!extra.getBoolean("active")) {
		Game.tipMessage(Native.Color.GREEN + 'Power: ' + Native.Color.WHITE + 'On');
		Item.setGlint(ItemID.magnet, true);
		extra.putBoolean('active', true);
		Player.setCarriedItem(ItemID.magnet, 1, 0, extra);
	} else {
		Game.tipMessage(Native.Color.GREEN + 'Power: ' + Native.Color.WHITE + 'Off');
		Item.setGlint(ItemID.magnet, false);
		extra.putBoolean('active', false);
		Player.setCarriedItem(ItemID.magnet, 1, 0, extra);
	}
});

var tickssss = 0;
Callback.addCallback("tick", function() {
	tickssss++;
	if (tickssss >= 10) {
		tickssss = 0;
		var equiped = searchItem(ItemID.magnet, 0) || baubleEquipMagnet;
		var magnetActivated;
		if (searchItem(ItemID.magnet, 0)) {
			var extra = new ItemExtraData(searchItem(ItemID.magnet, 0).extra);
			if (!extra.getBoolean("active")) {
				magnetActivated = false
			} else {
				magnetActivated = true
			}
		} else if (baubleEquipMagnet) {
			var baublesMagnet = {
				extra: null
			};
			for (var i = 0; i <= 1; i++) {
				if (Baubles.container.getSlot("ring" + i).id == ItemID.magnet) {
					baublesMagnet = Baubles.container.getSlot("ring" + i);
				}
			};
			var extra = new ItemExtraData(baublesMagnet.extra);
			if (!extra.getBoolean("active")) {
				magnetActivated = false
			} else {
				magnetActivated = true
			}
		}
		if (equiped && magnetActivated) {
			var p = Player.getPosition();
			var entity = Entity.getAllInRange(p, 15, 64);
			for (var i = 0; i < entity.length; i++) {
				Entity.moveToTarget(entity[i], p, {
					speed: 0.5,
					denyY: false,
					jumpVel: 0.5
				})
			}
		}
	}
});