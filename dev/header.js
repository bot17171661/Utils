IMPORT('StorageInterface');
const ScriptableObjectHelper = WRAP_JAVA('com.zhekasmirnov.innercore.api.mod.ScriptableObjectHelper');
const JavaFONT = WRAP_JAVA('com.zhekasmirnov.innercore.api.mod.ui.types.Font');

var _players = [];
Callback.addCallback('ServerPlayerLoaded', function(player__){
	_players =  Network.getConnectedPlayers();
});

function chatMessage(client, text){
	if(typeof(client) == 'string'){
		Game.message(client);
	} else {
		if(typeof(client) == "number") client = Network.getClientForPlayer(client);
		client.send("Utils.chatMessage", {text: text});
	}
}

function tipMessage(client, text){
	if(typeof(client) == 'string'){
		Network.sendToAllClients('Utils.tipMessage', {text: client});
	} else {
		if(typeof(client) == "number") client = Network.getClientForPlayer(client);
		client.send("Utils.tipMessage", {text: text});
	}
}

Network.addClientPacket('Utils.tipMessage', function(packetData){
	Game.tipMessage(packetData.text);
});

Network.addClientPacket('Utils.chatMessage', function(packetData){
	Game.message(packetData.text);
});