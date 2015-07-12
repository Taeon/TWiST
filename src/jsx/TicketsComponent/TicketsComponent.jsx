/** @jsx React.DOM */

var React   = require('react');
var Reflux   = require('reflux');

var TicketsStore = require( './TicketsStore' );
var TicketsActions = require( './TicketsActions' );

var ApplicationActions = require( '../Application/ApplicationActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

var TicketsComponent = React.createClass({

	priority_class_names:{
		'low':'priority-low',
		'medium':'priority-medium',
		'high':'priority-high',
	},

	componentDidMount: function() {
        this.unsubscribe = TicketsStore.listen(function(){this.forceUpdate()}.bind(this));
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },
  
	getInitialState: function() {
        return TicketsStore;
	},
	_CreateTask:function(){
		console.log(arguments);
	},
	_Reload:function(){
		TicketsStore.UpdateTickets();
	},
	_CurrentlyShowingChange:function( type ){
		TicketsActions.SetCurrentlyShowing( type );
	},

	render: function() {
		var content;
		if( TicketsStore.getState().status == TicketsStore.STATE_LOADING  ){
			content = <div className="waiting">...</div>;
		} else {

			var tickets = TicketsStore.getState()[ 'tickets_' + TicketsStore.getState().currently_showing ];

			var inner_content;
			if( tickets.length == 0 ){
				inner_content = <div className="none">No tickets to show</div>;
			} else {
				inner_content = <div className="tickets-items">{tickets.map(
					function (item, idx) {
						return <div className={"item ticket " + ((item.priority != '')?this.priority_class_names[ item.priority.toLowerCase() ]:'priority-none')}
							key={idx}>
								<div className="title"><a href={ApplicationStore.getData().user_account.URL + 'desk/#/tickets/' + item['id']} target="teamwork-desk">{item.subject}</a></div>
								<div className="details">{item.customer.firstName} {item.customer.lastName}</div>
				        		<div className="buttons">
					        		<button onTouchTap={this._CreateTask.bind(this, item.id)} className="material-icons">access_time</button>
					        	</div>
							</div>;
					}.bind(this)
					
				)}</div>				
			}

			content = 
			<div>
				<div className="tabs">
					<div 
						className={ "tab" + ((TicketsStore.getState().currently_showing==TicketsStore.TICKETS_MINE)?' active':'')}
						onTouchTap={this._CurrentlyShowingChange.bind(this, TicketsStore.TICKETS_MINE)}
					>Mine [{TicketsStore.getState().tickets_mine.length.toString()}]</div>
					<div
						className={ "tab" + ((TicketsStore.getState().currently_showing==TicketsStore.TICKETS_UNASSIGNED)?' active':'')}
						onTouchTap={this._CurrentlyShowingChange.bind(this, TicketsStore.TICKETS_UNASSIGNED)}
						>Unassigned [{TicketsStore.getState().tickets_unassigned.length.toString()}]</div>
				</div>
				{inner_content}
			</div>;
		}

	
		return (
			<div id="tickets">
				<div className="header">
					<h2>Tickets</h2>
					<div className="buttons"><button className="material-icons" onTouchTap={this._Reload}>replay</button></div>
				</div>
				{content}
			</div>
		);
	}

});


module.exports = TicketsComponent;