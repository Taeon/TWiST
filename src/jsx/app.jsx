/** @jsx React.DOM */
"use strict";

var React   = require('react');
var Reflux   = require('reflux');

var LoginActions = require( './LoginComponent/LoginActions' );
var LoginComponent = require( './LoginComponent/LoginComponent' );

var TasksActions = require( './TasksComponent/TasksActions' );
var TasksComponent = require( './TasksComponent/TasksComponent' );

var TicketsActions = require( './TicketsComponent/TicketsActions' );
var TicketsComponent = require( './TicketsComponent/TicketsComponent' );

var TimeActions = require( './TimeComponent/TimeActions' );
var TimeComponent = require( './TimeComponent/TimeComponent' );

var TimeEntryAddComponent = require( './TimeEntryAddComponent/TimeEntryAddComponent' );

var ApplicationStore = require( './Application/ApplicationStore' );
var ApplicationActions = require( './Application/ApplicationActions' );

var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


var AppContainerComponent = React.createClass(
	{

		mixins: [Reflux.ListenerMixin],

		componentWillMount: function() {
			// Catach login form submit
			LoginActions.FormSubmit.listen(
				function( data ){
					// This will trigger the application to attempt to connect to Teamwork
					ApplicationActions.SetAPIKey( data.api_key );
				}				
			);
			ApplicationStore.listen(
				function( data ){
					this.forceUpdate();
				}.bind( this )
			);
		},
		_handleLogoutClick:function(){
			ApplicationActions.Logout();
		},
		SwitchToTeamwork:function(){
			ApplicationActions.SwitchToTeamwork();
		},
		SwitchToTeamworkDesk:function(){
			ApplicationActions.SwitchToTeamworkDesk();
		},
		componentDidUpdate:function(){
			$('#panels, .frame').height( $( window ).height() - ($( 'header' ).height() + 30) );
		},
		render: function() {
			switch( ApplicationStore.getData().state ){
				case ApplicationStore.STATE_UNINITIALIZED:{
					var layout =
						<div>
							<LoginComponent/>
						</div>
					break;
				}
				case ApplicationStore.STATE_LOADING:{
					var layout =
						<div>
							Loading...
						</div>
					break;
				}
				case ApplicationStore.STATE_LOADED:{
					var layout =
						<div class="outer">
							<TimeEntryAddComponent/>
							<header>
								<h1 onTouchTap={ApplicationActions.SwitchToTwist}>TWiST</h1>
								<div className="buttons">
									<button onTouchTap={this._handleLogoutClick} className="material-icons">cancel</button>
								</div>
							</header>
							<div id="panels" className={((ApplicationStore.getData().currently_showing=='twist')?' active':'')}>
								<div className="panel">
									<TimeComponent/>
								</div>
								<div className="panel">
									<TasksComponent/>
								</div>
								<div className="panel">
									<TicketsComponent/>
								</div>
							</div>
						</div>
					;
					break;
				}
			}
			
			return layout;
		}
	}
);


module.exports = AppContainerComponent;

React.render(
	<AppContainerComponent/>,
	$('main').get(0)
);
