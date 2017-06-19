/* Main (index) page */

var React = require("react");
var { Panel } = require("react-bootstrap");

var { JobList } = require("../components/JobList");
var { SpiderList } = require("../components/SpiderList");
var { AggregateJobStats } = require("../components/JobStats");
var { ProcessStatsTable } = require("../components/ProcessStats");


export var IndexPage = React.createClass({
    render: function () {
        return (
            <div className="row">
                <div className="col-lg-7 col-md-7">
                    <Panel collapsible defaultExpanded header="Jobs" bsStyle="primary">
                        <JobList/>
                    </Panel>
                </div>
                <div className="col-lg-5 col-md-5">
                    <Panel collapsible defaultExpanded header="Arachnado Stats">
                        <ProcessStatsTable />
                    </Panel>
                    <Panel collapsible defaultExpanded header="Aggregate Crawl Stats">
                        <AggregateJobStats/>
                    </Panel>
                </div>
            </div>
        );
    }
});
