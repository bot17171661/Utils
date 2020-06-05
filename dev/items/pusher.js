/*IDRegistry.genItemID("pusher");
Item.createItem("pusher", "Pusher", {
 name: "stick"
}, {
 stack: 1
});
mod_tip(ItemID.pusher);

Item.setMaxDamage(ItemID.pusher, 1000);*/

/*
Recipes.addShaped({id: ItemID.magnet, count: 1, data: 0}, [
	"iir",
	"  i",
	"iib"
], ['i', 265, 0, 'r', 35, 14, 'b', 35, 11]);
*/
/*
for(var key in Item){
 Logger.Log(key);
}
*/
/*
Item.registerNoTargetUseFunction("pusher",function(coords, item, block){
 var vec = Entity.getLookVector(Player.get());
 //Game.message(JSON.stringify(Entity.getLookVector(Player.get())));
 	var item = Player.getCarriedItem();
	item.data += 2;
	if(item.data > Item.getMaxDamage(item.id)){
		item.id = item.data = item.count = 0;
		return Player.setCarriedItem(item.id, item.count, item.data, item.extra);
	}
	Player.setCarriedItem(item.id, item.count, item.data, item.extra);
 Entity.addVelocity(Player.get(), vec.x, vec.y, vec.z)
})
*/
/*Item.registerUsingReleasedFunction("pusher", function(a, b, c, d){
 Logger.Log("Released"+a+b+c+d);
})

Item.registerUsingCompleteFunction("pusher", function(a, b, c, d){
 Logger.Log("Complited"+a+b+c+d);
})*/