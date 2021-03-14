IDRegistry.genBlockID("itemCollector");

Block.createBlock("itemCollector", [{
    name: "Item Collector",
    texture: [
        ["itemCollector", 0]
    ],
    inCreative: true
}], 'opaque');
mod_tip(BlockID.itemCollector);

Recipes.addShaped({
    id: BlockID.itemCollector,
    count: 1,
    data: 0
}, [
    "cpc",
    "php",
    "cpc"
], ['h', 410, 0, 'p', 381, 0, 'c', 54, 0]);

const itemColRad = 10;

TileEntity.registerPrototype(BlockID.itemCollector, {
    defaultValues: {
        ticks: 0
    },
	useNetworkItemContainer: true,
    getTransportSlots: function() {
        return {
            //input: ["slot"],
            output: ["slot"]
        };
    },
    click: function(id, count, data, coords, player, extra) {
        var container_slot = this.container.getSlot("slot");
        if (container_slot.id == 0) return Game.message('Not available');
        chatMessage(player, Item.getName(container_slot.id, container_slot.data).split('\n')[0] + ' * ' + container_slot.count);
    },
    tick: function() {
        this.data.ticks++
        if (this.data.ticks >= 5) {
            var startCoords = {x:this.x+0.5,y:this.y+0.5,z:this.z+0.5};
            this.data.ticks = 0;
            var container_slot = this.container.getSlot("slot");
            if (container_slot.id != 0 && container_slot.count > 0)for (var i in newSides) {
                var _coords = {
                    x: this.x + newSides[i][0],
                    y: this.y + newSides[i][1],
                    z: this.z + newSides[i][2]
                }
                var tile = StorageInterface.getStorage(this.blockSource, _coords.x, _coords.y, _coords.z);
                if(tile){
                    //tile.addItem(container_slot, i, Item.getMaxStack(container_slot.id));
                    var slots = tile.getInputSlots(i);
                    var maxStack = Item.getMaxStack(container_slot.id);
                    for(var k in slots){
                        var slot = tile.container.getSlot(slots[k]);
                        if((!tile.isValidInput || tile.isValidInput(container_slot, i, this)) && (!tile.isValidSlotInput || tile.isValidSlotInput(slots[k], container_slot, i)) && (slot.id == 0 || (compareSlots(slot, container_slot, true) && slot.count < maxStack))){
                            var decount = Math.min(maxStack - slot.count, container_slot.count);
                            tile.container.setSlot(slots[k], container_slot.id, slot.count + decount, container_slot.data, container_slot.extra);
                            this.container.setSlot("slot", container_slot.id, container_slot.count - decount, container_slot.data, container_slot.extra);
                            container_slot.validate();
                        }
                    }
                }
            }
            var ents = Entity.getAllInRange(startCoords, itemColRad, 64);
            for (var i in ents) {
                var ent = ents[i];
                if (!ent) continue;
                var item = Entity.getDroppedItem(ent);
                if(!item) continue;
                var entityPos = Entity.getPosition(ent);
                var distanceToEnt = Entity.getDistanceBetweenCoords(startCoords, entityPos);
                Entity.moveToTarget(ent, startCoords, {
                    speed: 1/distanceToEnt
                });
                if(distanceToEnt > 1.5) continue;
                var max_stack = Item.getMaxStack(item.id);
                if (item.id == container_slot.id && item.data == container_slot.data && item.extra == container_slot.extra) {
                    var count = Math.min(container_slot.count + item.count, max_stack);
                    var other = Math.max(container_slot.count + item.count - max_stack, 0);
                    if(other == 0)
                        Entity.remove(ent);
                    else
                        Entity.setDroppedItem(ent, item.id, other, item.data, item.extra);
                    container_slot.count = count;
                    if (container_slot.count <= 0) {
                        container_slot.id = 0;
                    }
                } else if (container_slot.id == 0) {
                    var other = Math.max(container_slot.count + item.count - max_stack, 0);
                    this.container.setSlot("slot", item.id, Math.min(item.count, max_stack), item.data, item.extra || null);
                    if(other == 0)
                        Entity.remove(ent);
                    else
                        Entity.setDroppedItem(ent, item.id, other, item.data, item.extra);
                }
            }
        }
    }
});

ModAPI.addAPICallback("WailaAPI", function(api) {
    api.Waila.addExtension(BlockID.itemCollector, function(id, data, elements, tile, yPos) {
        if(!tile)return yPos;
        var item = tile.container.getSlot("slot");
        var name = item.id != 0 && item.count > 0 ? Item.getName(item.id, item.data) + " * " + item.count : "Not available";
        elements["itemCollector_slot"] = {
            type: "text",
            text: "Item: " + name,
            x: 200,
            y: yPos,
            font: {
                color: api.Style.DEF,
                size: 40
            }
        };
        yPos += 60;

        api.Waila.requireHeight(20);
        return yPos;
    })
});

StorageInterface.createInterface(BlockID.itemCollector, {
	slots: {
		"slot": {output: true}
	}
});