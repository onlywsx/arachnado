require("babel-core/polyfill");
var Reflux = require("reflux");
var debounce = require("debounce");
var { FancyWebSocket } = require("../utils/FancyWebSocket");
var API = require("../utils/ArachnadoAPI");


export var Actions = Reflux.createActions([
    "setAll",
    "setOne",
    "startCrawl",
    "saveCrawl",
    "removeCrawl",
]);


export var store = Reflux.createStore({
    init: function () {
        this.spiders = [];
        this.listenToMany(Actions);
        this.triggerDebounced = debounce(this.trigger, 200);
    },

    getInitialState: function () {
        return this.spiders;
    },

    onSetAll: function (spiders) {
        this.spiders = spiders;
        this.triggerDebounced(spiders);
    },

    onSetOne: function (spider) {
        this.spiders.push(spider)
        this.trigger(this.spiders);
    },

    onStartCrawl: function (domain, options) {
        API.startCrawl(domain, options);
    },

    onSaveCrawl: function (spiderId, domain, options) {
        API.saveCrawl(spiderId, domain, options);
    },

    onRemoveCrawl: function (spider) {
        var spiderIndex = this.spiders.findIndex((spider_) => {
            return spider_._id == spider._id;
        });
        if(spiderIndex !== -1) {
            this.spiders.splice(spiderIndex, 1);
            this.trigger(this.spiders);
            API.removeCrawl(spider._id);
        }
    },
});


var socket = FancyWebSocket.instance(window.WS_SERVER_ADDRESS);
socket.on("spiders:state", (spider) => {
    Actions.setOne(spider);
});

Actions.setAll(window.INITIAL_DATA.spiders);

