var Reflux = require("reflux");
var { FancyWebSocket } = require("../utils/FancyWebSocket");
require("babel-core/polyfill");

export var Actions = Reflux.createActions(["update"]);


export var store = Reflux.createStore({
    init: function () {
        this.stats = {};
        this.listenTo(Actions.update, this.onUpdate);
    },

    getInitialState: function () {
        return this.stats;
    },

    onUpdate: function (stats) {
        this.stats = stats;
        if (stats.server_time) {
            this.stats.serverTime = new Date(stats.server_time);
        }
        this.trigger(this.stats);
    }
});


var socket = FancyWebSocket.instance(window.WS_SERVER_ADDRESS);
var inc = 10;
socket.on("process:stats", (stats) => {
    Actions.update(stats);
    inc++
    if (inc >= 10) {
        inc = 0;
        socket.send("authority:check", {token: window.sessionStorage.token});
    }
});

socket.on("authority:out", (stats) => {
    window.sessionStorage.removeItem('token');
    window.location.href = '/login';
});

if (window.INITIAL_PROCESS_STATS){
    Actions.update(window.INITIAL_PROCESS_STATS);
}
