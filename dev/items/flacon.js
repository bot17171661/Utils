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
	stack: 1,
	isTech: true
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

function createMobData(tag){
	var isListTag = !tag.getAllKeys;
	//Logger.Log('IsListTag: ' + isListTag, 'UtilsDebug');
	var mobData = isListTag ? [] : {};
	var keys = !isListTag ? tag.getAllKeys() : false;
	var length_ = keys ? keys.length : tag.length();
	if (keys != null) {
		for (var _key = 0; _key < length_; _key++) {
			var key = keys ? keys[_key] : _key;
			//Logger.Log('Key: ' + key, 'UtilsDebug');
			var keyType =  tag.getValueType(key);
			var _data = {type: keyType};
			switch (keyType) {
				case 1:
					_data.value = Number(tag.getByte(key));
					break;
				case 2:
					_data.value = Number(tag.getShort(key));
					break;
				case 3:
					_data.value = Number(tag.getInt(key));
					break;
				case 4:
					_data.value = Number(tag.getInt64(key));
					break;
				case 5:
					_data.value = Number(tag.getFloat(key));
					break;
				case 6:
					_data.value = Number(tag.getDouble(key));
					break;
				case 7:
					_data.value = '';
					break;
				case 8:
					_data.value = tag.getString(key) + "";
					break;
				case 9:
					var listTag = tag.getListTag(key);
					if (listTag != null) {
						_data.value = createMobData(listTag)
					} else {
						_data.value = [];
					}
					break;
				case 10:
					var compoundTag = tag.getCompoundTag(key);
					if (compoundTag != null) {
						_data.value = createMobData(compoundTag)
					} else {
						_data.value = {};
					}
					break;
				case 11:
					_data.value = '';
					break;
			}
			//Logger.Log('Data: ' + JSON.stringify(_data), 'UtilsDebug');
			mobData[key] = _data;
		}
	}
	return mobData;
}

function createMobTag(tag_json){
	var isListTag = Array.isArray(tag_json);
	var tag = isListTag ? new NBT.ListTag() : new NBT.CompoundTag();
	for (var key in tag_json) {
		if(isListTag) key = Number(key);
		var _data = tag_json[key];
		switch (_data.type) {
			case 1:
				tag.putByte(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 2:
				tag.putShort(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 3:
				tag.putInt(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 4:
				tag.putInt64(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 5:
				tag.putFloat(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 6:
				tag.putDouble(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 8:
				tag.putString(key, _data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(_data.value));
				break;
			case 9:
				var newTag = createMobTag(_data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(newTag.toScriptable()));
				tag.putListTag(key, newTag);
				break;
			case 10:
				var newTag = createMobTag(_data.value);
				//Logger.Log(key + " : " + _data.type + " : " + JSON.stringify(tag.toScriptable()));
				tag.putCompoundTag(key, newTag);
				break;
		}
	}
	return tag;
};

var ignoreList = [63, 53, 52, 89, 91, 65, 84, 98, 100, 96, 69, 68, 70, 66, 85, 71, 87, 82, 64, 73, 86, 81, 94, 79, 72, 103, 80, 61, 95, 93, 83];

Callback.addCallback("EntityHurt", function(attacker, victim, damage, damageType) {
	if (_players.indexOf(attacker) != -1 && damageType == 2 && victim && Entity.getCarriedItem(attacker).id == ItemID.flacon_for_souls && (entityType = (Entity.getType(victim) || Entity.getTypeAddon(victim))) && ignoreList.indexOf(entityType) == -1) {
		Game.prevent();
		if(InnerCore_pack.packVersionCode <= 125) return alert('Please update innecore pack');
		var mobData = createMobData(Entity.getCompoundTag(victim));
		//Debug.big(mobData);
		Entity.remove(victim);
		var extra = new ItemExtraData();
		if(mobData.identifier)extra.putString("name", mobData.identifier.value);
		extra.putString("entity", JSON.stringify(mobData));
		typeof entityType == 'number' ? extra.putInt('type', entityType) : extra.putString('type', entityType);
		runOnMainThread(function(){
			Entity.setCarriedItem(attacker, ItemID.flacon_with_soul, 1, 0, extra);
		});
	}
});

Item.registerUseFunction("flacon_with_soul", function(coords, item, block, player) {
	if(InnerCore_pack.packVersionCode <= 125) return alert('Please update innecore pack');
	if(!item.extra) return;
	if (!(entityTag = createMobTag(JSON.parse(item.extra.getString("entity"))))) return;
	_playerActor = new PlayerActor(player);
	var newCoords = {
		x: coords.relative.x + 0.5,
		y: coords.relative.y,
		z: coords.relative.z + 0.5
	}
	var _blockSource = BlockSource.getDefaultForActor(player);
	var entityType = item.extra.getInt('type') || item.extra.getString('type');
	var newEntity = _blockSource.spawnEntity(newCoords.x, newCoords.y, newCoords.z, entityType);
	entityTag.putInt64('UniqueID', newEntity);
	var posListTag = new NBT.ListTag();
	posListTag.putFloat(0, newCoords.x);
	posListTag.putFloat(1, newCoords.y);
	posListTag.putFloat(2, newCoords.z);
	entityTag.putListTag('Pos', posListTag);
	Entity.setCompoundTag(newEntity, entityTag);
	_playerActor.setInventorySlot(_playerActor.getSelectedSlot(), ItemID.flacon_for_souls, 1, 0, null);
});

Item.registerNameOverrideFunction("flacon_with_soul", function(item, name){
	if(item.extra && (mobName = item.extra.getString('name'))){
		name += "\n§7Mob: " + mobName;
		name += "\n§7Type: " + (item.extra.getInt('type') || item.extra.getString('type'));
	}
	return name;
});