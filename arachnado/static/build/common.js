webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _require = __webpack_require__(1);

	var FancyWebSocket = _require.FancyWebSocket;

	var ConnectionMonitor = __webpack_require__(3);
	var ProcessStats = __webpack_require__(667);

	$(window).ready(function () {
	    ConnectionMonitor.install("arachnado-connection-monitor");
	    ProcessStats.installHeader("arachnado-process-stats");
	});

/***/ }),
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	A widget which shows if a server is idle/crawling or if we're not connected.
	*/

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports.install = install;
	var React = __webpack_require__(4);
	var ReactDOM = __webpack_require__(34);
	var Reflux = __webpack_require__(172);

	var _require = __webpack_require__(190);

	var Label = _require.Label;

	var ConnectionStore = __webpack_require__(472);

	var ConnectionMonitorWidget = React.createClass({
	    displayName: 'ConnectionMonitorWidget',

	    STATE_CLASSES: {
	        'offline': 'danger',
	        'online': 'info',
	        'crawling': 'success'
	    },

	    render: function render() {
	        var cls = this.STATE_CLASSES[this.props.status] || "default";
	        return React.createElement(
	            Label,
	            { bsStyle: cls, title: 'reconnect', style: { cursor: "pointer" }, onClick: this.onClick },
	            this.props.status
	        );
	    },

	    onClick: function onClick() {
	        ConnectionStore.Actions.reconnect();
	    }
	});

	var ConnectionMonitor = React.createClass({
	    displayName: 'ConnectionMonitor',

	    mixins: [Reflux.connect(ConnectionStore.store, "status")],
	    render: function render() {
	        return React.createElement(ConnectionMonitorWidget, { status: this.state.status });
	    }
	});

	function install(elemId) {
	    ReactDOM.render(React.createElement(ConnectionMonitor, null), document.getElementById(elemId));
	}

/***/ })
]);