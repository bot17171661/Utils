IDRegistry.genBlockID("worldClock");

Block.createBlock("worldClock", [
	{
		name: "World Clock",
		texture: [
			["worldClock", 0]
		],
		inCreative: true
	}
], 'opaque');
Block.setTempDestroyTime(BlockID.worldClock, 3);
mod_tip(BlockID.worldClock);

Recipes.addShaped({ id: BlockID.worldClock, count: 1, data: 0 }, [
	"dbd",
	"bcb",
	"dbd"
], ['c', 347, 0, 'b', 42, 0, 'd', 264, 0]);

TileEntity.registerPrototype(BlockID.worldClock, {
	defaultValues: {
		redstones: 0,
		redstoneSignal: false
	},
	redstone: function (params) {
		devLog(JSON.stringify(params));
		if (params.onLoad) return;
		if (params.power > 0)
			this.data.redstones++;
		else
			this.data.redstones--;
		if (this.data.redstones == 0)
			this.data.redstoneSignal = false;
		else
			this.data.redstoneSignal = true;

	},
	tick: function () {
		if (this.data.redstoneSignal) {
			World.setWorldTime(World.getWorldTime() + 50);
		}
	}
});

