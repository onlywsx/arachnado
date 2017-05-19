/* A list of active crawl jobs */

var React = require("react");
var Reflux = require("reflux");
var filesize = require("filesize");
var prettyMs = require('pretty-ms');
var { History, withRouter } = require('react-router');

var { Table, Glyphicon, Button } = require("react-bootstrap");
var SpiderStore = require("../stores/SpiderStore");
var { SpidersMixin } = require("./RefluxMixins");
var ProcessStatsStore = require("../stores/ProcessStatsStore");


require("babel-core/polyfill");



var NoSpiders = withRouter(React.createClass({
    render: function () {
        var cb = () => {
            this.props.router.push(`/spider/add`);
        };
        return (<div><button className="btn btn-success btn-xs" onClick={cb}>
                            <Glyphicon glyph="plus" /> Create
                        </button>
            <p>No spiders to show.</p>
            <p>
                Create a spider either by using "Create" button
                or by using Arachnado HTTP API.
            </p>
        </div>);
    }
}));

var GlyphA = React.createClass({
    render: function () {
        var txt = this.props.button ? " " + this.props.title : "";
        return (
            <a href='#' {...this.props}>
                <Glyphicon glyph={this.props.glyph} />{txt}
            </a>
        )
    },
});



export var SpiderStartButton = React.createClass({
    render: function () {
        return <GlyphA title="Crawl" glyph="play" onClick={this.onClick}
            button={this.props.button} className={this.props.className} />;
    },

    onClick: function (ev) {
        ev.preventDefault();
        var options = {
            settings: this.props.spider.settings,
            args: this.props.spider.args
        }
        SpiderStore.Actions.startCrawl(this.props.spider.domain, options);
    }
});


export var SpiderControlIcons = React.createClass({
    render: function () {
        var spider = this.props.spider;
        var props = { spider: spider };

        var items = [];
        items.push(<span key="start"><SpiderStartButton className="btn btn-primary btn-xs" {...props} />&nbsp;&nbsp;</span>);
        return <span>{items}</span>;
    }
});

export var SpiderControlButtons = React.createClass({
    render: function () {
        var spider = this.props.spider;
        var props = { button: true, spider: spider };

        var items = [];
        items.push(<span key="start"><SpiderStartButton className="btn" {...props} />&nbsp;&nbsp;</span>);
        return <span>{items}</span>;
    }
});

function parseDate(dt) {
    var dt = dt.replace(" ", "T") + "Z";
    return new Date(dt).Format('yyyy-MM-dd hh:mm:ss');
};

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var SpiderRow = withRouter(React.createClass({
    render: function () {
        var spider = this.props.spider;
        var shortId = spider._id.slice(0, 10) + "…";
        var style = { cursor: "pointer" };
        var cb = () => {
            this.props.router.push(`/spider/${spider._id}`);
        };
        

        var columns = [
            <td key='col-buttons'><SpiderControlIcons spider={spider} /></td>,
            <th key='col-id' scope="row" style={style} onClick={cb}>{shortId}</th>
        ];
        var created_at = parseDate(spider.created_at);

        var data = [
            spider.name,
            spider.domain,
            created_at,
        ];

        columns = columns.concat(
            data.map((v, i) => <td style={style} onClick={cb} key={i}>{v}</td>)
        );
        columns.push(<td><GlyphA title="Remove" glyph="minus" onClick={this.onDelClick} className="btn btn-danger btn-xs" /></td>);
        return <tr>{columns}</tr>;
    },

    onDelClick: function (ev) {
        ev.preventDefault();
        SpiderStore.Actions.removeCrawl(this.props.spider);
    }
}));


export var SpiderListWidget = withRouter(React.createClass({

    render: function () {
        var rows = this.props.spiders.map(spider => {
            return <SpiderRow spider={spider} key={spider._id} />;
        });
        var cb = () => {
            this.props.router.push(`/spider/add`);
        };
        return <Table fill hover={this.props.link}>
            <thead>
                <tr>
                    <th key='col-buttons'>
                        <button className="btn btn-success btn-xs" onClick={cb}>
                            <Glyphicon glyph="plus" /> Create
                        </button>
                    </th>
                    <th key='col-id'>ID</th>
                    <th key='col-name'>Name</th>
                    <th key='col-domain'>Domain</th>
                    <th key='col-createdat' className="col-md-2">CreatedAt</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>;
    }
}));


export var SpiderList = React.createClass({
    mixins: [SpidersMixin],
    render: function () {
        var spiders = this.state.spiders;
        if (!spiders.length) {
            return <NoSpiders />;
        }
        return <SpiderListWidget spiders={spiders} />;
    }
});
