webpackJsonp([0],[function(e,t,n){"use strict";var s=n(1),o=(s.FancyWebSocket,n(3)),c=n(667);$(window).ready(function(){o.install("arachnado-connection-monitor"),c.installHeader("arachnado-process-stats")})},,,function(e,t,n){"use strict";function s(e){c.render(o.createElement(d,null),document.getElementById(e))}Object.defineProperty(t,"__esModule",{value:!0}),t.install=s;var o=n(4),c=n(34),i=n(172),r=n(190),a=r.Label,l=n(472),u=o.createClass({displayName:"ConnectionMonitorWidget",STATE_CLASSES:{offline:"danger",online:"info",crawling:"success"},render:function(){var e=this.STATE_CLASSES[this.props.status]||"default";return o.createElement(a,{bsStyle:e,title:"reconnect",style:{cursor:"pointer"},onClick:this.onClick},this.props.status)},onClick:function(){l.Actions.reconnect()}}),d=o.createClass({displayName:"ConnectionMonitor",mixins:[i.connect(l.store,"status")],render:function(){return o.createElement(u,{status:this.state.status})}})}]);