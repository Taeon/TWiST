var React   = require('react');
var Reflux   = require('reflux');

var TicketsStore = require( './TicketsStore' );
var TicketsActions = require( './TicketsActions' );

var TimeStore = require( '../TimeComponent/TimeStore' );


var ApplicationActions = require( '../Application/ApplicationActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

var TicketToTaskAddComponent = require( '../TicketToTaskAddComponent/TicketToTaskAddComponent' );

var Modal = require( '../ModalComponent/ModalComponent' );

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
	_CreateTask:function( id ){
		TicketsStore.setState
		( 
			{
				show_ticket_form:true,
				current_ticket_id:id
			}
		);
	},
	_ClaimTicket:function( id ){
		TicketsActions.ClaimTicket( id );
	},
	_Reload:function(){
		TicketsStore.UpdateTickets();
	},
	_CurrentlyShowingChange:function( type ){
		TicketsActions.SetCurrentlyShowing( type );
	},
	_HideTicketForm:function(){
		TicketsStore.setState( {show_ticket_form:false} );
	},

	render: function() {

		var form = false;
		if(TicketsStore.getState().show_ticket_form){
			form = <Modal title="Create ticket" show={true} onClose={this._HideTicketForm}>
			  <TicketToTaskAddComponent 
			  	ticket_id={TicketsStore.getState().current_ticket_id}
			  	onSubmit={function(){this._HideTicketForm();}.bind(this)}
			  />
			</Modal>
			;				
		}


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

						var claim_button = null;
						if( TicketsStore.getState().currently_showing == 'unassigned' ){
							claim_button = <button onTouchTap={this._ClaimTicket.bind(this, item.id)} className="material-icons">reply</button>;
						}

						return <div className={"item ticket " + ((item.priority != '')?this.priority_class_names[ item.priority.toLowerCase() ]:'priority-none')}
							key={idx}>
								<div className="title"><a href={ApplicationStore.getData().user_account.URL + 'desk/#/tickets/' + item['id']} target="teamwork-desk">{item.subject}</a></div>
								<div className="details">{item.customer.firstName} {item.customer.lastName}</div>
				        		<div className="buttons">
					        		{claim_button}
					        		<button onTouchTap={this._CreateTask.bind(this, item.id)} className="material-icons" title="Create task">toc</button>
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
				{form}
			</div>
		);
	}

});


module.exports = TicketsComponent;