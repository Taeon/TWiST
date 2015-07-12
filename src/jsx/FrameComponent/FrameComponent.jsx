/** @jsx React.DOM */

var React   = require('react');
var Reflux   = require('reflux');

var ApplicationActions = require( '../Application/ApplicationActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

var Component = React.createClass({

	getDefaultProps:function(){
		return {
			src: null,
			id:''
		}
	},
	shouldComponentUpdate:function(){
		return true;
	},
	render: function() {
		var content;
		if( this.props.src != null ){
			content = <iframe frameBorder="0" src={this.props.src}></iframe>;
		} else {
			content = '';
		}

		return <div className={"frame" + ((ApplicationStore.getData().currently_showing==this.props.id)?' active':'')} id={"frame-" + this.props.id }>
			{content}
		</div>;

	}

});


module.exports = Component;