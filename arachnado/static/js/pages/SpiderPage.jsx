/* Job page */

var React = require("react");
var Reflux = require("reflux");
var { Link } = require('react-router');
var { Panel, Table, Button, Glyphicon, ButtonToolbar } = require("react-bootstrap");

var SpiderStore = require("../stores/SpiderStore");
var { ProcessStatsTable } = require("../components/ProcessStats");
var { JobStats } = require("../components/JobStats");
var { JobListWidgetVerbose, JobControlButtons } = require("../components/JobList");
var { ShortTermQueueWidget } = require("../components/JobTransfers.jsx");
var { CrawlForm } = require("../components/CrawlForm");


/*var ShortSpiderInfo = React.createClass({
    render: function () {
        var spider = this.props.spider;
        var spiders = [spider];
        return <SpiderListWidgetVerbose jobs={spiders} />;
    }
});


var SipderInfo = React.createClass({
    render: function () {
        var sipder = this.props.sipder;
        var kvpairs = [
            ["Target", sipder.seed],
            ["Status", sipder.status],
            ["Job ID", sipder.id],
            ["Started at", sipder.stats.start_time],
        ];
        if (job.stats.finish_time){
            kvpairs.push(["Finished at", job.stats.finish_time]);
        }

        var rows = kvpairs.map(p => <tr key={p[0]}><td>{p[0]}</td><td>{p[1]}</td></tr>);
        return (
            <div>
                <Table>
                    <caption>General Sipder Information</caption>
                    <tbody>{rows}</tbody>
                </Table>
            </div>
        );
    }
});*/


var NoSipderPage = React.createClass({
    render: function () {
        return (
            <div>
                <h2>Sipder is not found</h2>
                <p>This Sipder is either not available or never existed.</p>
                <Link to="/">
                    <Glyphicon glyph="menu-left"/>&nbsp;
                    Back to Full Sipder List
                </Link>
            </div>
        );
    }
});


export var SpiderPage = React.createClass({
    mixins: [
        Reflux.connectFilter(SpiderStore.store, "spider", function(spiders) {
            return spiders.filter(spider => spider._id == this.props.params.id)[0];
        })
    ],

    render: function () {
        if (!this.state.spider && this.props.params.id != 'add'){
            return <NoSipderPage/>;
        }
        var spider = this.state.spider ? JSON.parse(JSON.stringify(this.state.spider)) : null
        return (
            <div className="row">
                <div className="row">
                    <div className="col-lg-12">
                        <Link to="/" className="btn">
                            <Glyphicon glyph="menu-left"/>&nbsp;All Spiders
                        </Link>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-7">
                        <CrawlForm action={window.START_CRAWL_URL} spider={spider} />
                    </div>
                </div>
            </div>
        );
    }
});
