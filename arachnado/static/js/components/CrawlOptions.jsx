var React = require("react");
var { KeyValueList } = require("./KeyValueList");
var { ValueList } = require("./ValueList");


export var CrawlOptions = React.createClass({
    render: function() {
        return (
            <div className="panel panel-default" style={{marginTop: '-16px'}}>
                <div className="panel-collapse collapse in">
                    <div className="panel-body">
                        <ValueList title="Urls"
                                      list={this.props.startUrls}
                                      valuePlaceholder="Start_Url"
                                      onChange={this.props.onStartUrlsChange}/>
                        <KeyValueList title="Rules"
                                      list={this.props.rules}
                                      keyPlaceholder="Allow_Url_Rule"
                                      valuePlaceholder="Parse"
                                      onChange={this.props.onRulesChange}/>
                        <KeyValueList title="Parse"
                                      list={this.props.parses}
                                      keyPlaceholder="Parse_Field"
                                      valuePlaceholder="Match"
                                      onChange={this.props.onParsesChange}/>
                    </div>
                </div>
            </div>
        );
    }

});
