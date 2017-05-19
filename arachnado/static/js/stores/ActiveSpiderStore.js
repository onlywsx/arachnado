require("babel-core/polyfill");
var Reflux = require("reflux");
var debounce = require("debounce");


export var Actions = Reflux.createActions([
    "setOne",
]);


export var store = Reflux.createStore({
    init: function () {
        this.spider = {};
        this.listenToMany(Actions);
        this.triggerDebounced = debounce(this.trigger, 200);
    },

    getInitialState: function () {
        return this.spider;
    },

    onSetOne: function (spider) {
        if (spider.domain && spider.args) {
            this.spider = {
                domain: spider.domain,
                startUrls: spider.args.startUrls,
                rules: spider.args.rules,
                parses: spider.args.parses,
            };
        } else {
            this.spider = {}
        }
        this.trigger(this.spider);
    }
});


