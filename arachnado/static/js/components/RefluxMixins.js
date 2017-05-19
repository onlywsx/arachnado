var React = require("react");
var Reflux = require("reflux");
var JobStore = require("../stores/JobStore");
var SpiderStore = require("../stores/SpiderStore");

export var JobsMixin = Reflux.connect(JobStore.store, "jobs");
export var SpidersMixin = Reflux.connect(SpiderStore.store, "spiders");
