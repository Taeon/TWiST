var React   = require('react');
var Reflux   = require('reflux');
var moment   = require('moment');

var TimeStore = require( './TimeStore' );
var TimeActions = require( './TimeActions' );

var TimeEntryAddComponent = require( '../TimeEntryAddComponent/TimeEntryAddComponent' );
var TimeEntryEditComponent = require( '../TimeEntryEditComponent/TimeEntryEditComponent' );

var TimerComponent = require( './TimerComponent' );

var Utilities = require( '../../js/TwistUtilities.js' );

var ProjectsStore = require( '../Projects/ProjectsStore' );

var ApplicationActions = require( '../Application/ApplicationActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

var Modal = require( '../ModalComponent/ModalComponent' );

var TimeComponent = React.createClass({

	componentDidMount: function() {
        this.unsubscribe = TimeStore.listen(function(){this.forceUpdate()}.bind(this));
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },
	getInitialState: function() {
        return TimeStore;
	},
	/**
 	 * Restart an existing timed event
	 */
	_StartTimer:function( timer_id ){
		// Retrieve timer details
		var timer = TimeStore.getState().times.filter( function(item){if(item.id==timer_id){return item}} )[0];
		if( timer['todo-item-id'] != ''){
			this._StartTaskTimer( timer['todo-item-id'] );
		} else {
			this._StartTimeEntryTimer( timer['id'] );
		}
		// Restart timer
	},
	_StartTaskTimer:function( task_id ){
		ApplicationStore.getData().teamwork_api.GetTask( task_id ).then(
			function( data ){
				TimeActions.StartTaskTimer( data[ 'todo-item' ] );
			}
		);
	},
	_StartTimeEntryTimer:function( time_entry_id ){
		ApplicationActions.GetTimeEntry( time_entry_id ).then(
			function( data ){
				TimeActions.StartTimeEntryTimer( data[ 'time-entry' ] );
			}
		);
	},
	_ShowAddForm:function(){
		TimeStore.setState( {show_add_form:true} );
	},
	_EditTimeEntry:function( id ){
		TimeStore.setState( 
			{
				show_edit_form:true,
				current_time_entry_id:id
			} 
		);
	},
	_SetBillable:function( id, state ){

// Have to send the time again or it gets changed
for( var i = 0; time_entry = TimeStore.getState().times[ i ]; i++ ){
	if( time_entry.id == id ){
		var time = moment( time_entry.date, moment.ISO_8601 );
		break;
	}
}

		ApplicationActions.UpdateTimeEntry(
			id, 
			{
				isbillable:((state)?1:0),
				time: time.format( 'HH:mm' )
			} 
		).then(
			TimeStore.UpdateTimes
		);
	},
	_HideAddForm:function(){
		TimeStore.setState( {show_add_form:false} );
	},
	_HideEditForm:function(){
		TimeStore.setState( {show_edit_form:false} );
	},

	render: function() {
		var list;
		if( TimeStore.getState().status == TimeStore.STATE_LOADING ){
			list = <div className="waiting">...</div>;
		} else {

			var times_by_day = {};
			var days = [];
			if( ( typeof TimeStore.getState().times != 'undefined' && TimeStore.getState().times.length > 0 ) ){
				for( var i = 0; i < 7; i++ ){
					var date = moment();
					date.subtract( i, 'days' );
					times_by_day[date.format( 'YYYYMMDD' )] = {
						date: date,
						time: 0,
						time_entries: []
					};
				}
	
				var time_entry;
				for( var i = 0; time_entry = TimeStore.getState().times[ i ]; i++ ){
					var date = moment( time_entry.date );
					var date_string = date.format( 'YYYYMMDD' );
	if( typeof times_by_day[ date_string ] != 'undefined' ){
					times_by_day[ date_string ].time_entries.push( time_entry )
	
	}
				}
				var days = [];
				for( var i = 0; i < 7; i++ ){
					var date = moment();
					date.subtract( i, 'days' );
					var index = date.format( 'YYYYMMDD' );
					if( times_by_day[ index ].time_entries.length > 0 ){
						days.push( times_by_day[ index ] );
					}
				};
	
				for( var d = 0; day = days[ d ]; d++ ){
					var hours = 0;
					var minutes = 0;
					for( var t = 0; time_entry = day.time_entries[ t ]; t++ ){
						hours += parseInt( time_entry.hours, 10 );
						minutes += parseInt( time_entry.minutes, 10 );
					}
					day.time = ( hours + Math.floor( minutes / 60 ) ).toString() + 'h' + Utilities.ZeroPad( (minutes % 60).toString(), 2 ) + 'm';
				}
			}

	        var timer = '';
	        if( TimeStore.getState().current_timer_start_time != null ){
	        	var timer = <TimerComponent />
	        }

	        var button_new = <button className="material-icons">add</button>;
			var form;
			if(TimeStore.getState().show_add_form){
				form = <Modal title="Add a timer" show={true} onClose={this._HideAddForm}>
				  <TimeEntryAddComponent onSubmit={this._HideAddForm}/>
				</Modal>
				;				
			}
			if(TimeStore.getState().show_edit_form){
				form = <Modal title="Edit a timer" show={true} onClose={this._HideEditForm}>
				  <TimeEntryEditComponent 
				  	time_entry_id={TimeStore.getState().current_time_entry_id}
				  	onSubmit={function(){this._HideEditForm();TimeStore.UpdateTimes()}.bind(this)}
				  />
				</Modal>
				;				
			}
			
			list = <div className="days">{
				days.map(
					function (item, day_idx) {
						return <div key={day_idx} className="day">
							<h3>{item.date.format( 'dddd, MMMM Do' )}</h3>
							<div className="time-total">{item.time}</div>
							{
								item.time_entries.map(
									function( item, time_idx ){
										var time = moment( item.date, moment.ISO_8601 );
										var title = item.description;
										if( item['todo-item-id' ] != '' ){
											var title = <a href={ApplicationStore.getData().user_account.URL + 'tasks/' + item['todo-item-id']} target="teamwork">{item['todo-item-name']}</a>;
										}

										return <div
											key={time_idx}
											className="item time-entry">
								        		<div className="title">{title}</div>
								        		<div className="timer">{item['hours'].toString()}h{Utilities.ZeroPad(item['minutes'],2 )}m</div>
								        		<div className="buttons">
									        		<button onTouchTap={this._StartTimer.bind(this, item['id'])} className="material-icons">access_time</button>
									        	</div>
												<div className="details">
													{item[ 'company-name' ]} / <a href={ApplicationStore.getData().user_account.URL + 'projects/' + item[ 'project-id' ].toString() + '/time'} target="teamwork">{item['project-name']}</a> / {time.format( 'HH:mm' )} - {time.add(item.hours,'hours').add(item.minutes,'minutes').format( 'HH:mm' )}
												</div>
								        		<div className="buttons additional">
													<button className={ "material-icons billable" + ((item.isbillable == "1")?' active':'')} onTouchTap={this._SetBillable.bind(this,item.id,!(item.isbillable=="1"))}>attach_money</button>
									        		<button onTouchTap={TimeActions.DeleteTimeEntry.bind(this,item.id)} className="material-icons" title="Delete">highlight_off</button>
									        		<button onTouchTap={this._EditTimeEntry.bind(this, item['id'])} className="material-icons" title="Edit">create</button>
									        	</div>
												<div style={{backgroundColor:Utilities.StringToRGB(item['company-name'])}} className="marker"></div>
												<div style={{backgroundColor:Utilities.StringToRGB(item['project-name'])}} className="marker project"></div>
											</div>;
									}.bind( this )
								)
							}
						</div>;
					}.bind(this)
				)
			}</div>;
		}

		return (
			<div id="time">
				<div className="header">
					<h2><a href={ApplicationStore.getData().user_account.URL + 'people/' + ApplicationStore.getData().user_account.userId +'?tabView=time'} target="teamwork">Time</a></h2>
					<div className="buttons"><button onTouchTap={this._ShowAddForm} className="material-icons">add</button></div>
				</div>
				{timer}
				{list}
				{form}
			</div>
		);
	}

});


module.exports = TimeComponent;