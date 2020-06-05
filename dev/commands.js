Callback.addCallback("NativeCommand", function (str) { 
  if(str.substr(0,6) == '/utils'){
    var commands = str.substr(7).split(" ");
    if(commands[0] == "execute"){
      if(commands.length == 1) return Game.message("/utils execute [command]");
      eval(str.substr(15));
    } else if(commands[0] == "get"){
      if(commands[1] == "death_items"){
        if(!__config__.getBool("grave")) return Game.message("grave is disabled");
        if(commands.length == 2) return Game.message("/utils get death_items [id]");
        if(!title_death_datas[+commands[2]]) return Game.message("§cWrong params!");
        var pos = Player.getPosition();
        pos.y -= 1;
        World.setBlock(pos.x, pos.y, pos.z, BlockID.grave, 0);
        World.addTileEntity(pos.x, pos.y, pos.z)
        for(var i in title_death_datas[+commands[2]].items){
          var Item = title_death_datas[+commands[2]].items[i];
          World.getContainer(pos.x, pos.y, pos.z).getSlot("slot"+i).id = Item.id;
          World.getContainer(pos.x, pos.y, pos.z).getSlot("slot"+i).count = Item.count;
          World.getContainer(pos.x, pos.y, pos.z).getSlot("slot"+i).data = Item.data;
          World.getContainer(pos.x, pos.y, pos.z).getSlot("slot"+i).extra = Item.extra;
        }
      } else {
        Game.message("death_items");
      }
    } else {
      Game.message("execute, get");
    }
  }
});