ModAPI.registerAPI("UtilsAPI", {
    //Combiner: Combiner,
    ignoreList: ignoreList, //flacon.js
    requireGlobal: function (command) {
        return eval(command);
    }
});
Logger.Log("UtilsAPI Loaded", "API");