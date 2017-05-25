/* A form for starting the crawl */

var React = require("react");
var Reflux = require("reflux");
var { Panel, Glyphicon } = require("react-bootstrap");
var { History, withRouter } = require('react-router');

var {CrawlOptions} = require("../components/CrawlOptions");
var SpiderStore = require("../stores/SpiderStore");
var {keyValueListToDict, valueListToList} = require('../utils/SitesAPI');


// it must be rendered inside a small bootstrap Panel
var noPadding = {
    paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0
};

var tinyPadding = {
    paddingLeft: 0, paddingRight: 1, marginLeft: 0, marginRight: 0
};

export var CrawlForm = withRouter(React.createClass({
    getInitialState: function () {
        var spider = this.props.spider;
        if (spider) {
            return {_id:spider._id, domain: spider.domain, name: spider.args.name, startUrls: spider.args.startUrls, rules: spider.args.rules, parses: spider.args.parses};
        }
        return {_id: '', domain: '', name: '', startUrls: [], rules: [], parses: []};
    },

    render: function () {
        return (
            <div>
                <form method="post" className="container-fluid" style={noPadding}
                      action={this.props.action} onSubmit={this.onSubmit}>
                    <div className="form-group row" style={noPadding}>
                        <div className="col-xs-2"  style={noPadding}>
                            <button type="submit" className="btn btn-success" style={{width:"100%"}}>Save</button>
                        </div>
                        <div className="col-xs-3" style={tinyPadding}>
                            <input type="text" className="form-control" name="name"
                                   ref="nameInput" value={this.state.name}
                                   onChange={this.onNameChange}
                                   placeholder="NAME, e.g. scrapy"/>
                        </div>
                        <div className="col-xs-7" style={tinyPadding}>
                            <input type="text" className="form-control" name="domain"
                                   ref="domainInput" value={this.state.domain}
                                   onChange={this.onChange}
                                   placeholder="DOMAIN, e.g. scrapy.org"/>
                        </div>
                    </div>
                </form>
                <CrawlOptions startUrls={this.state.startUrls} rules={this.state.rules}
                        parses={this.state.parses}
                        onStartUrlsChange={this.onStartUrlsChange} onRulesChange={this.onRulesChange} 
                        onParsesChange={this.onParsesChange} />
            </div>
        );
    },

    onChange: function (ev) {
        var domain = this.refs.domainInput.value;
        this.setState({domain: domain});
    },

    onNameChange: function (ev) {
        var name = this.refs.nameInput.value;
        this.setState({name: name});
    },

    onSubmit: function (ev) {
        ev.preventDefault();
        var options = {};
        options['args'] = {
            name: this.state.name,
            startUrls: this.state.startUrls,
            rules: this.state.rules,
            parses: this.state.parses
        }

        if (this.state.domain != "") {
            SpiderStore.Actions.saveCrawl(this.state._id, this.state.domain, options);
            this.props.router.push(`/`);
        }
    },

    onStartUrlsChange: function(startUrls) {
        this.setState({startUrls: startUrls});
    },

    onRulesChange: function(rules) {
        this.setState({rules: rules});
    },

    onParsesChange: function(parses) {
        this.setState({parses: parses});
    }

}));

