IDRegistry.genItemID("angelRing");
Item.createItem("angelRing", "Angel ring", {
	name: "angelRing"
}, {
	stack: 1
});
mod_tip(ItemID.angelRing);
var baubleEquip = false;
var ringEquiped = false;

Recipes.addShaped({
	id: ItemID.angelRing,
	count: 1,
	data: 0
}, [
	"g#g",
	"#s#",
	" # "
], ['s', 399, 0, '#', 266, 0, 'g', 20, 0]);

Callback.addCallback("tick", function() {
	if (!ringEquiped) {
		if (searchItem(ItemID.angelRing)) {
			Player.setFlyingEnabled(true);
			ringEquiped = true;
		}
	} else if (ringEquiped && !baubleEquip) {
		if (!searchItem(ItemID.angelRing)) {
			ringEquiped = false;
			if(Game.getGameMode() != 1){
				Player.setFlyingEnabled(false);
				Player.setFlying(false);
			}
		}
	}
});

(function(){
	var superTempPlayerSetFlyingEnabled = Player.setFlyingEnabled;
	var superTempPlayerSetFlying = Player.setFlying;
	Player.setFlyingEnabled = function(enabled, forced){
		if(!ringEquiped || forced)superTempPlayerSetFlyingEnabled(enabled);
	}
	Player.setFlying = function(enabled, forced){
		if(!ringEquiped || forced)superTempPlayerSetFlying(enabled);
	}
})()

ModAPI.addAPICallback("BaublesAPI", function(api) {
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
})

Callback.addCallback("EntityHurt", function(attacker, victim, damage, damageType) {
	if ((searchItem(ItemID.angelRing) || baubleEquip) && victim == Player.get() && damageType == 5) {
		Game.prevent();
	}
});

Callback.addCallback('LevelLeft', function(){
	baubleEquip = false;
	ringEquiped = false;
})