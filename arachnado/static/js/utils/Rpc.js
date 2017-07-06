var { FancyWebSocket } = require("../utils/FancyWebSocket");

export var socket = FancyWebSocket.instance(window.WS_RPC_ADDRESS);


var dfds = {};
var id = 0;

socket.on("rpc:response", (response) => {
    var dfd = dfds[response.id];
    if(dfd) {
        dfd.resolve(response.result)
        delete dfds[response.id]
    }
});

socket.on("authority:out", (stats) => {
    window.sessionStorage.removeItem('token');
    window.location.href = '/login';
});

export var call = function(method, params) {
    var dfd = new $.Deferred();
    dfds[id] = dfd;
    if (!params) {
        params = {}
    }
    params['token'] = window.sessionStorage.token
    socket.send("rpc:request", {id: id, jsonrpc: "2.0", method: method, params: params});
    id++;
    return dfd.promise();
}
