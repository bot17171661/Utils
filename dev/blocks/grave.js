var title_death_datas = [];

function asd() {
	IDRegistry.genBlockID("grave");

	Block.createBlock("grave", [{
		name: "Grave",
		texture: [
			["stone", 0]
		],
		inCreative: false
	}]);
	mod_tip(BlockID.grave);

	TileEntity.registerPrototype(BlockID.grave, {
		container: new UI.Container()
	});
	var Dmodel = new ICRender.CollisionShape();
	var entry = Dmodel.addEntry();

	var render = new ICRender.Model();
	BlockRenderer.setStaticICRender(BlockID.grave, 0, render);

	var boxes = [{
			box: [0, 0, 0, 1, 0.05, 1],
			material: {
				id: 3,
				data: 1
			}
		},
		{
			box: [0.05, 0.05, 0.05, 0.95, 0.1, 0.95],
			material: {
				id: 3,
				data: 1
			}
		},
		{
			box: [0.1, 0.1, 0.15, 0.13, 0.85, 0.85],
			material: {
				id: 4,
				data: 0
			}
		},
		{
			box: [0.1, 0.85, 0.20, 0.13, 0.9, 0.8],
			material: {
				id: 4,
				data: 0
			}
		}
	]

	for (var i in boxes) {
		var box = boxes[i].box;
		var material = boxes[i].material;

		var model = BlockRenderer.createModel();

		model.addBox(box[0], box[1], box[2], box[3], box[4], box[5], material.id, material.data);

		render.addEntry(model);
	}
	entry.addBox(0, 0, 0, 1, 0.2, 1);

	BlockRenderer.setCustomCollisionShape(BlockID.grave, 0, Dmodel)

	//BlockRenderer.setStaticICRender(BlockID.grave, -1, icRenderModel)

	Block.setTempDestroyTime(BlockID.grave, 1);

	Block.registerDropFunction(BlockID.grave, function() {
		return [];
	})

	IDRegistry.genItemID("title_death");
	Item.createItem("title_death", "Description of death", {
		name: "descOfDeath"
	}, {
		stack: 1
	});
	mod_tip(ItemID.title_death);

	Saver.addSavesScope("UtilsGrave",
		function read(scope) {
			title_death_datas = scope.title_death_datas;
			if (!title_death_datas) title_death_datas = [];
		},
		function save() {
			var data = {
				title_death_datas: title_death_datas
			}
			return data;
		}
	);

	Callback.addCallback("LevelLeft", function () {
		title_death_datas = [];
	});

	Item.registerNameOverrideFunction(ItemID.title_death, function(item, name) {
		name = "§b" + name;
		if (!title_death_datas[item.data]) return name;
		name += " #" + item.data;
		var items = title_death_datas[item.data].items;
		var length = (items.length > 10) ? 10 : items.length;
		for (var i = 0; i < length; i++) {
			name += "\n§7" + Item.getName(items[i].id, items[i].data) + " * " + items[i].count;
		}
		if (items.length > 10) name += "\n§7and " + (items.length - length) + " more...";
		return name
	})

	Item.registerUseFunction("title_death", function(coords, item, block) {
		if (!title_death_datas[item.data]) {
			return Game.message("§cWrong data!");
		}
		var data = title_death_datas[item.data];
		var gui = new UI.Window({
			location: {
				x: 200,
				y: 75,
				width: 600,
				height: 400
			},
			drawing: [{
				type: "color",
				color: android.graphics.Color.TRANSPARENT
			}],
			elements: {
				"frame": {
					type: "frame",
					x: 0,
					y: 0,
					width: 1000,
					height: 670,
					bitmap: "frame",
					scale: 5,
				}
			}
		})
		gui.setAsGameOverlay(true);
		var container = new UI.Container();
		container.openAs(gui);
		var items = data.items;
		var content = container.getGuiContent();
		var x = 10,
			y = 10;
		content.elements["date"] = {
			type: "text",
			x: 600,
			y: 20,
			text: "Date: " + data.date,
			font: {
				color: android.graphics.Color.WHITE,
				shadow: 0.5,
				size: 20
			}
		}
		content.elements["dim"] = {
			type: "text",
			x: 600,
			y: 50,
			text: "Dimension: " + data.dimension,
			font: {
				color: android.graphics.Color.WHITE,
				shadow: 0.5,
				size: 20
			}
		}
		var length = 10;
		var pages = [];
		var z = [];
		var f = 0;
		var b = 0;
		for (var i = 1; i <= items.length; i++) {
			z[f] = i - 1;
			f++;
			if (("" + i / length).indexOf(".") == -1 && i / length != 0) {
				pages[b] = z;
				z = [];
				f = 0;
				b++;
			}
		}
		pages[b] = z;
		var page = 1;
		for (var i = 0; i < length; i++) {
			content.elements["slot_item" + i] = {
				type: "slot",
				x: x,
				y: y,
				bitmap: "_default_slot_empty",
				isTransparentBackground: true,
				visual: true
			};
			container.getSlot("slot_item" + i).id = 0;
			container.getSlot("slot_item" + i).data = 0;
			container.getSlot("slot_item" + i).count = 0;
			container.getSlot("slot_item" + i).extra = null;
			content.elements["text_item" + i] = {
				type: "text",
				x: x + 60,
				y: y + 15,
				text: "",
				font: {
					color: android.graphics.Color.WHITE,
					shadow: 0.5,
					size: 20
				}
			}
			y += 54;
		}
		content.elements["frame2"] = {
			type: "frame",
			x: 0,
			y: y,
			width: 1000,
			height: content.elements["frame"].height - y,
			bitmap: "frame",
			scale: 5,
		}
		content.elements["pages"] = {
			type: "text",
			x: 390,
			y: 580,
			text: "Page: " + page + "/" + pages.length,
			font: {
				color: android.graphics.Color.WHITE,
				shadow: 0.5,
				size: 41
			}
		}
		content.elements["closeButton"] = {
			type: "closeButton",
			x: 900,
			y: 0,
			bitmap: "close_button",
			bitmap2: "close_button",
			scale: 5
		}

		function clearSlots() {
			for (var i = 0; i < length; i++) {
				container.getSlot("slot_item" + i).id = 0;
				container.getSlot("slot_item" + i).data = 0;
				container.getSlot("slot_item" + i).count = 0;
				container.getSlot("slot_item" + i).extra = null;
				content.elements["text_item" + i].text = "";
			}
		}

		function switchPage(p) {
			if (p < 1 || p > pages.length) return
			page = p;
			content.elements["pages"].text = "Page: " + page + "/" + pages.length;
			clearSlots();
			var g = 0;
			for (var i = 0; i < pages[p - 1].length; i++) {
				container.getSlot("slot_item" + g).id = items[pages[p - 1][i]].id;
				container.getSlot("slot_item" + g).data = items[pages[p - 1][i]].data;
				container.getSlot("slot_item" + g).count = items[pages[p - 1][i]].count;
				container.getSlot("slot_item" + g).extra = items[pages[p - 1][i]].extra;
				var name = Item.getName(items[pages[p - 1][i]].id, items[pages[p - 1][i]].data).replace(/§./g, "").split("\n")[0];
				content.elements["text_item" + g].text = (name.length > 30) ? name.substr(0, 30) + "..." : name;
				g++;
			}
		}
		switchPage(1);
		content.elements["arrow_left"] = {
			type: "image",
			x: 20,
			y: 570,
			bitmap: "arrow_left",
			scale: 5,
			clicker: {
				onClick: function(position, container, tileEntity, window, canvas, scale) {
					switchPage(page - 1);
				},
				onLongClick: function(position, container, tileEntity, window, canvas, scale) {

				}
			}
		}
		content.elements["arrow_right"] = {
			type: "image",
			x: 900,
			y: 570,
			bitmap: "arrow_right",
			scale: 5,
			clicker: {
				onClick: function(position, container, tileEntity, window, canvas, scale) {
					switchPage(page + 1);
				},
				onLongClick: function(position, container, tileEntity, window, canvas, scale) {

				}
			}
		}
	})
	Callback.addCallback("EntityDeath", function(entity) {
		if (entity == Player.get()) {
			var items = [];
			var pos = Player.getPosition();
			pos.y -= 1;
			World.setBlock(pos.x, pos.y, pos.z, BlockID.grave, 0);
			World.addTileEntity(pos.x, pos.y, pos.z);
			var container = World.getContainer(pos.x, pos.y, pos.z);
			for (var i = 0; i <= 35; i++) {
				var Item = Player.getInventorySlot(i);
				container.setSlot("slot" + i, Item.id, Item.count, Item.data, Item.extra);
				Player.setInventorySlot(i, 0, 0, 0, null);
				if (Item.id != 0) items.push({
					id: Item.id,
					data: Item.data,
					extra: Item.extra,
					count: Item.count
				});
			}
			for (var i = 0; i <= 3; i++) {
			  var Item = Player.getArmorSlot(i);
			  var _i = i + 36
			  container.setSlot("slot" + _i, Item.id, Item.count, Item.data, Item.extra);
				Player.setArmorSlot(i, 0, 0, 0, null);
				if (Item.id != 0) items.push({
					id: Item.id,
					data: Item.data,
					extra: Item.extra,
					count: Item.count
				});
		  }
		  var Item = Player.getOffhandItem();
			 var _i = 40;
			 container.setSlot("slot" + _i, Item.id, Item.count, Item.data, Item.extra);
			Player.setOffhandItem(0, 0, 0, null);
			if (Item.id != 0) items.push({
				id: Item.id,
				data: Item.data,
				extra: Item.extra,
				count: Item.count
			});
			//Commands.exec("clear @a");
			var date = new Date();
			var datemonth = date.getMonth() + 1;
			date = ((date.getHours() < 10) ? "0" + date.getHours() : date.getHours()) + ":" + ((date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes()) + ":" + ((date.getSeconds() < 10) ? "0" + date.getSeconds() : date.getSeconds()) + " " + ((date.getDate() < 10) ? "0" + date.getDate() : date.getDate()) + "." + ((datemonth < 10) ? "0" + datemonth : datemonth) + "." + date.getFullYear();
			var dim = Player.getDimension();
			setTimeout(function() {
				Player.addItemToInventory(ItemID.title_death, 1, title_death_datas.length);
				var full_data = {
					items: items,
					date: date,
					dimension: dim
				}
				title_death_datas[title_death_datas.length] = full_data
			}, 10);
		}
	});
}
// if (__config__.getBool("grave")) {
// 	asd()
// }