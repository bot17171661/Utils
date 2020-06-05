ModAPI.registerAPI("UtilsAPI", {
    Combiner: Combiner,

    requireGlobal: function (command) {
        return eval(command);
    }
});
Logger.Log("UtilsAPI Loaded", "API");