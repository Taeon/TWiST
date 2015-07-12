/** @jsx React.DOM */

var React   = require('react');
var Reflux   = require('reflux');

var LoginStore = require( './LoginStore' );
var LoginActions = require( './LoginActions' );

var LoginComponent = React.createClass({

	mixins: [Reflux.ListenerMixin],

    listenables: [LoginActions],

	getInitialState: function() {
		return LoginStore;
	},
	// Pull initial state from store
    componentWillMount: function() {
    },
    componentDidMount: function () {
    },
	_handleSignIn:function( event ){
		LoginActions.FormSubmit(
			{
				api_key:React.findDOMNode(this.refs.form_api_key).value
			}
		);
	},
	render: function() {
		return (
			<div>
				<h1>Enter your Teamwork API key</h1>
				<input type="text" ref="form_api_key" placeholder="API Key"/>
				<button ref="form_button_signin" onTouchTap={this._handleSignIn}>Sign in</button>
			</div>
		);
	}

});

module.exports = LoginComponent;