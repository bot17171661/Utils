IDRegistry.genItemID("flacon_for_souls");
Item.createItem("flacon_for_souls", "Flacon for souls", {
	name: "flacon_for_souls"
}, {
	stack: 1
});
mod_tip(ItemID.flacon_for_souls);

IDRegistry.genItemID("flacon_with_soul");
Item.createItem("flacon_with_soul", "Flacon with soul", {
	name: "flacon_with_soul"
}, {
	stack: 1
});
mod_tip(ItemID.flacon_with_soul);

Recipes.addShaped({
	id: ItemID.flacon_for_souls,
	count: 1,
	data: 0
}, [
	" s ",
	"g g",
	" g "
], ['s', 158, -1, 'g', 20, 0]);

Item.registerNoTargetUseFunction("flacon_for_souls", function(item) {
	var data = getPointed();
	if (data.entity != -1) {
		var entity = {
			health: Entity.getHealth(data.entity),
			carriedItem: Entity.getCarriedItem(data.entity),
			type: Entity.getType(data.entity),
			age: Entity.getAge(data.entity),
			mobile: Entity.getMobile(data.entity),
			sneaking: Entity.getSneaking(data.entity),
			lookAngle: Entity.getLookAngle(data.entity),
			armorSlot0: Entity.getArmorSlot(data.entity, 0),
			armorSlot1: Entity.getArmorSlot(data.entity, 1),
			armorSlot2: Entity.getArmorSlot(data.entity, 2),
			armorSlot3: Entity.getArmorSlot(data.entity, 3),
		}
		Entity.remove(data.entity);
		var extra = new ItemExtraData();
		extra.putString("entity", JSON.stringify(entity));
		Player.setCarriedItem(ItemID.flacon_with_soul, 1, 0, extra);
		devLog(JSON.stringify(entity));
	}
})

Item.registerUseFunction("flacon_with_soul", function(coords) {
	var item = Player.getCarriedItem();
	var extra = new ItemExtraData(item.extra);
	if (!extra.getString("entity")) return;
	var entity = JSON.parse(extra.getString("entity"));
	var newCoords = {
		x: coords.x + 0.5,
		y: coords.y + 1,
		z: coords.z + 0.5
	}
	var newEntity = Entity.spawnAtCoords(newCoords, entity.type);
	Entity.setHealth(newEntity, entity.health);
	Entity.setCarriedItem(newEntity, entity.carriedItem.id, entity.carriedItem.count, entity.carriedItem.data);
	if (entity.mobile) Entity.setMobile(newEntity, true);
	Entity.setAge(newEntity, entity.age);
	Entity.setSneaking(newEntity, entity.sneaking);
	Entity.setLookAngle(newEntity, entity.lookAngle.yaw, entity.lookAngle.pitch);
	for (var i = 0; i < 4; i++) {
		Entity.setArmorSlot(newEntity, i, entity["armorSlot" + i].id, entity["armorSlot" + i].count, entity["armorSlot" + i].data);
	}
	Player.setCarriedItem(ItemID.flacon_for_souls, 1, 0);
})