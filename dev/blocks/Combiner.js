IDRegistry.genBlockID("Combiner");
Block.createBlock("Combiner", [
    {
        name: "Combiner",
        texture: [
            ["combiner", 1],
            ["combiner", 0],
            ["combiner", 1],
            ["combiner", 1],
            ["combiner", 1],
            ["combiner", 1]
        ],
        inCreative: true
    }/*,
  {
    name: "Combiner",
    texture: [
      ["combiner", 1],
      ["combiner", 3],
      ["combiner", 1],
      ["combiner", 1],
      ["combiner", 1],
      ["combiner", 1]
    ], 
    inCreative: true
  },
  {
    name: "Combiner",
    texture: [
      ["combiner", 1],
      ["combiner", 0],
      ["combiner", 1],
      ["combiner", 1],
      ["combiner", 1],
      ["combiner", 1]
    ], 
    inCreative: true
  },
  {
    name: "Combiner",
    texture: [
      ["combiner", 1],
      ["combiner", 3],
      ["combiner", 1],
      ["combiner", 1],
      ["combiner", 1],
      ["combiner", 1]
    ], 
    inCreative: true
  }*/
]);
mod_tip(BlockID.Combiner);

Recipes.addShaped({ id: BlockID.Combiner, count: 1, data: 0 }, [
    "cpc",
    "p p",
    "cpc"
], ['p', 49, 0, 'c', 159, 14]);

var CombinerGUI = new UI.StandartWindow({
    standart: {
        header: {
            text: {
                text: "Combiner"
            }
        },
        inventory: {
            standart: true
        },
        background: {
            standart: true
        }
    },

    drawing: [],

    elements: {
        "item1": {
            type: "slot",
            x: 420,
            y: 180
        },
        "plus": {
            type: "image",
            x: 520,
            y: 182,
            scale: 0.8,
            bitmap: "plus"
        },
        "item2": {
            type: "slot",
            x: 615,
            y: 180
        },
        "arrow": {
            type: "image",
            x: 715,
            y: 182,
            scale: 0.8,
            bitmap: "_workbench_bar"
        },
        "result": {
            type: "slot",
            x: 810,
            y: 180
        }
    }
});

var render = new ICRender.Model();
BlockRenderer.setStaticICRender(BlockID.Combiner, -1, render);

var boxes = [
    [0, 0, 0, 1, 0.8, 1]
]

for (var i in boxes) {
    var box = boxes[i];
    var model = BlockRenderer.createModel();
    model.addBox(box[0], box[1], box[2], box[3], box[4], box[5], BlockID.Combiner, 0);
    render.addEntry(model);
}

var shakingAnim = function (anim, data, coords) {
    data.rotation[0] += Math.PI / 180 * 10;
    anim.setPos(coords.x, coords.y + 0.1, coords.z);
    anim.describeItem(data);
    setTimeout(function () {
        data.rotation[1] += Math.PI / 180 * 10;
        anim.setPos(coords.x, coords.y + 0.085, coords.z);
        anim.describeItem(data);
        setTimeout(function () {
            data.rotation[0] -= Math.PI / 180 * 20;
            anim.setPos(coords.x, coords.y + 0.070, coords.z);
            anim.describeItem(data);
            setTimeout(function () {
                data.rotation[0] += Math.PI / 180 * 10;
                data.rotation[1] -= Math.PI / 180 * 10;
                anim.setPos(coords.x, coords.y, coords.z);
                anim.describeItem(data);
                return true;
            }, 2)
        }, 2)
    }, 2)
}

var Crafts = []

var Combiner = {
    /*
     data = {
      item1: {
       id: 331, 
       data: -1
      }, 
      item2: {
       id: 348, 
       data: -1
      }, 
      result: {
       id: ItemID.concentratedDust, 
       data:0
      }
     }
     Если data = -1, то будут верны блоки/предметы с любой data
    */
    addCraft: function (data) {
        if (!data) return Logger.Log("Data not listed", "UtilsAPI ERROR")
        if (!data.item1 || !data.item2 || !data.result) return Logger.Log("Data wrong", "UtilsAPI ERROR");
        for (k in data) {
            if (!data[k].id || (data[k].data != 0 && !data[k].data)) return Logger.Log('Data wrong "' + k + '"', "UtilsAPI ERROR")
        }
        Crafts.push(data)
    },
	/*
  data = {
   item1: {
    id: 331, 
    data: -1
   }, 
   item2: {
    id: 348, 
    data: -1
   }, 
   result: {
    id: ItemID.concentratedDust, 
    data:0
   }
  }
  Если data = -1, то будут верны блоки/предметы с любой data
 */
    removeCraft: function (data) {
        if (!data) return Logger.Log("Data not listed", "UtilsAPI ERROR")
        if (!data.item1 || !data.item2 || !data.result) return Logger.Log("Data wrong", "UtilsAPI ERROR");
        for (k in data) {
            if (!data[k].id || !data[k].data) return Logger.Log("Data wrong", "UtilsAPI ERROR")
        }
        Crafts.splice(Crafts.find(function (element, index, array) {
            if (element.item1.id == data.item1.id && (element.item1.data == data.item1.data || data.item1.data == -1) && element.item2.id == data.item2.id && (element.item2.data == data.item2.data || data.item2.data == -1) && data.result.id == element.result.id && (data.result.id == element.result.id || data.result.id == -1)) {
                return index
            }
        }), 1);
    }
}

TileEntity.registerPrototype(BlockID.Combiner, {
    defaultValues: {
        anim1: null,
        anim2: null,
        ticks: 0,
        item1: null,
        item2: null,
        used: 0,
        rotation1: null,
        rotation2: null,
        crafting: false
    },
    getGuiScreen: function () {
        return CombinerGUI;
    },
    getTransportSlots: function () {
        return {
            input: ["item1", "item2"],
            output: ["result"]
        };
    },
    click: function (id, count, data, coords) {
        if (id == ItemID.utilsHammer) {
            if (this.container.getSlot('item1').id != 0 && this.container.getSlot('item2').id != 0) {
                var container = this.container;
                var anim1 = this.data.anim1;
                var anim2 = this.data.anim2;
                var used = this.data.used;
                var rotation1 = this.data.rotation1;
                var rotation2 = this.data.rotation2;
                var crafting = this.data.crafting;
                var ths = this;
                if (Crafts.find(function (element, index, array) {
                    if (element.item1.id == container.getSlot('item1').id && (element.item1.data == container.getSlot('item1').data || element.item1.data == -1) && element.item2.id == container.getSlot('item2').id && (element.item2.data == container.getSlot('item2').data || element.item2.data == -1)) {
                        return element
                    }
                })) {
                    var result = Crafts.find(function (element, index, array) {
                        if (element.item1.id == container.getSlot('item1').id && (element.item1.data == container.getSlot('item1').data || element.item1.data == -1) && element.item2.id == container.getSlot('item2').id && (element.item2.data == container.getSlot('item2').data || element.item2.data == -1)) {
                            return element
                        }
                    }).result;
                    if ((container.getSlot('result').id == result.id || container.getSlot('result').id == 0) && container.getSlot('result').count <= Item.getMaxStack(result.id) && !crafting) {
                        ths.data.crafting = true;
                        setTimeout(function () {
                            ths.data.crafting = false;
                        }, 10)
                        Player.setCarriedItem(id, count, data + 2);
                        if (data >= 98) {
                            Player.setCarriedItem(0, 0, 0);
                        }
                        shakingAnim(anim1, {
                            id: container.getSlot('item1').id,
                            count: 1,
                            data: container.getSlot('item1').data,
                            size: 0.25,
                            rotation: rotation1,
                            notRandomize: true
                        }, anim1.coords);
                        shakingAnim(anim2, {
                            id: container.getSlot('item2').id,
                            count: 1,
                            data: container.getSlot('item2').data,
                            size: 0.25,
                            rotation: rotation2,
                            notRandomize: true
                        }, anim2.coords);
                        ths.data.used++
                        if (ths.data.used >= 3) {
                            ths.data.used = 0;
                            var slot = container.getSlot('result');
                            slot.id = result.id;
                            slot.count += 1;
                            slot.data = result.data;
                            var item1 = container.getSlot('item1');
                            var item2 = container.getSlot('item2');
                            if (item1.count == 1) {
                                item1.id = 0;
                                item1.count = 0;
                                item1.data = 0;
                            } else {
                                item1.count -= 1
                            }
                            if (item2.count == 1) {
                                item2.id = 0;
                                item2.count = 0;
                                item2.data = 0;
                            } else {
                                item2.count -= 1
                            }
                        }

                    }
                }
            }
            return true
        }
    },
    tick: function () {
        this.data.ticks++;
        if (this.data.ticks >= 10) {
            this.data.ticks = 0;
            if (this.container.getSlot('item1').id != 0) {
                if (!this.data.anim1) {
                    var bonus_coords = { x: 0, y: 0, z: 0 };
                    this.data.rotation1 = [0, 0, 0];
                    if (all_items.indexOf(this.container.getSlot('item1').id) != -1) {
                        bonus_coords.x -= 0.0625 / 2 + 0.0625 / 8 - 1 / 16 / 2 - 1 / 16 / 8;
                        bonus_coords.y -= 0.0625 - 0.0625 / 6 + 1 / 16 / 4 * 3.5;
                        bonus_coords.z += 0.0625 / 2 + 0.0625 / 8 - 1 / 16 / 2 - 1 / 16 / 8;
                        this.data.rotation1 = [Math.PI / 2, Math.PI, 0];
                    }
                    this.data.anim1 = new Animation.Item(this.x + 0.3203125 - 1 / 16 / 2 - 1 / 16 / 8 + bonus_coords.x, this.y + 0.870 + 1 / 16 / 4 * 3.5 + bonus_coords.y, this.z + 0.4609375 + 1 / 16 / 2 + 1 / 16 / 8 + bonus_coords.z);
                    this.data.anim1.describeItem({
                        id: this.container.getSlot('item1').id,
                        count: 1,
                        data: this.container.getSlot('item1').data,
                        size: 0.25,
                        rotation: this.data.rotation1,
                        notRandomize: true
                    });
                    this.data.anim1.load();
                }
            } else if (this.data.anim1) {
                this.data.anim1.destroy();
                this.data.anim1 = null;
            }
            if (this.container.getSlot('item2').id != 0) {
                if (!this.data.anim2) {
                    var bonus_coords = { x: 0, y: 0, z: 0 };
                    this.data.rotation2 = [0, 0, 0];
                    if (all_items.indexOf(this.container.getSlot('item2').id) != -1) {
                        bonus_coords.x -= 0.0625 / 2 + 0.0625 / 8 - 1 / 16 / 2 - 1 / 16 / 8;
                        bonus_coords.y -= 0.0625 - 0.0625 / 6 + 1 / 16 / 4 * 3.5;
                        bonus_coords.z += 0.0625 / 2 + 0.0625 / 8 - 1 / 16 / 2 - 1 / 16 / 8;
                        this.data.rotation2 = [Math.PI / 2, Math.PI, 0];
                    }
                    this.data.anim2 = new Animation.Item(this.x + 0.7578125 - 1 / 16 / 2 - 1 / 16 / 8 + bonus_coords.x, this.y + 0.870 + 1 / 16 / 4 * 3.5 + bonus_coords.y, this.z + 0.4609375 + 1 / 16 / 2 + 1 / 16 / 8 + bonus_coords.z);
                    this.data.anim2.describeItem({
                        id: this.container.getSlot('item2').id,
                        count: 1,
                        data: this.container.getSlot('item2').data,
                        size: 0.25,
                        rotation: this.data.rotation2,
                        notRandomize: true
                    });
                    this.data.anim2.load();
                }
            } else if (this.data.anim2) {
                this.data.anim2.destroy();
                this.data.anim2 = null;
            }
        }
    },
    init: function () {
        if (this.data.anim1) {
            this.data.anim1.load();
        }
        if (this.data.anim2) {
            this.data.anim2.load();
        }
    },
    destroyBlock: function (coords, player) {
        if (this.data.anim1) {
            this.data.anim1.destroy();
            this.data.anim1 = null;
        }
        if (this.data.anim2) {
            this.data.anim2.destroy();
            this.data.anim2 = null;
        }
    }
});

ModAPI.addAPICallback("WailaAPI", function (api) {
    api.Waila.addExtension(BlockID.Combiner, function (id, data, elements, tile, yPos) {
        var item1 = tile.container.getSlot("item1");
        item1.name = Item.getName(item1.id, item1.data) + " * " + item1.count;
        if (!Item.getName(item1.id, item1.data)) item1.name = "Not available";
        var item2 = tile.container.getSlot("item2");
        item2.name = Item.getName(item2.id, item2.data) + " * " + item2.count;
        if (!Item.getName(item2.id, item2.data)) item2.name = "Not available";
        var result = tile.container.getSlot("result");
        result.name = Item.getName(result.id, result.data) + " * " + result.count;
        if (!Item.getName(result.id, result.data)) result.name = "Not available";
        elements["Item1"] = {
            type: "text",
            text: "Item1: " + item1.name,
            x: 200,
            y: yPos,
            font: { color: api.Style.DEF, size: 40 }
        };
        yPos += 60;

        elements["Item2"] = {
            type: "text",
            text: "Item2: " + item2.name,
            x: 200,
            y: yPos,
            font: { color: api.Style.DEF, size: 40 }
        };
        yPos += 60;

        elements["Result"] = {
            type: "text",
            text: "Result: " + result.name,
            x: 200,
            y: yPos,
            font: { color: api.Style.DEF, size: 40 }
        };
        yPos += 60;

        api.Waila.requireHeight(60);
        return yPos;
    })
})