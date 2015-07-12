/** @jsx React.DOM */

var React   = require('react');
var Reflux   = require('reflux');
var moment   = require('moment');

var TimeStore = require( './TimeStore' );
var TimeActions = require( './TimeActions' );

var TimeEntryAddActions = require( '../TimeEntryAddComponent/TimeEntryAddActions' );

var Utilities = require( '../../js/TwistUtilities.js' );

var ProjectsStore = require( '../Projects/ProjectsStore' );

var ApplicationActions = require( '../Application/ApplicationActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

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
	_StartTaskTimer:function( task_id ){
		ApplicationActions.GetTask( task_id ).then(
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
		TimeEntryAddActions.ShowForm();
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

	render: function() {
		var list;
		if( TimeStore.getState().status == TimeStore.STATE_LOADING || TimeStore.getState().times.length == 0 ){
			list = <div className="waiting">...</div>;
		} else {

			var times_by_day = {};
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
	        	day.time = ( hours + Math.floor( minutes / 60 ) ).toString() + 'h' + TwistUtilities.ZeroPad( (minutes % 60).toString(), 2 ) + 'm';
	        }

	        var timer = '';
	        if( TimeStore.getState().current_timer_start_time != null ){
	        	this.timer_interval = setTimeout( function(){ this.forceUpdate() }.bind(this), 1000 );
	        	var seconds = moment().unix() - TimeStore.getState().current_timer_start_time.unix();
	        	var title = '';
	        	switch( TimeStore.getState().current_timer_type ){
	        		case 'task':{
		        		title = TimeStore.getState().current_timer_details.content;
		        		break;
	        		}
	        		case 'time_entry':{
		        		title = TimeStore.getState().current_timer_details.description;
		        		break;
	        		}
	        	}
	        	var time = Math.floor( seconds / 3600 ).toString() + ':' + TwistUtilities.ZeroPad(( Math.floor( seconds / 60 ) % 60 ).toString(),2) + ':' + TwistUtilities.ZeroPad((seconds % 60).toString(), 2);
	        	document.title = time + ' - ' + title;
	        	timer = <div className="item current_timer">
	        		<div className="title">{title}</div><div className="timer">{time}</div>
	        		<div className="buttons">
		        		<button onTouchTap={TimeActions.StopTimer} className="material-icons">stop</button>
		        		<button onTouchTap={TimeActions.DeleteTimer}className="material-icons">delete</button>
		        	</div>
					<div className="details">{TimeStore.getState().current_timer_details[ 'company-name' ]} / {TimeStore.getState().current_timer_details[ 'project-name' ]} / {TimeStore.getState().current_timer_start_time.format('HH:mm')} -</div>
	        	</div>;
	        }


			list = <div className="days">{timer}{
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
												<div className="buttons left">
													<button className={ "material-icons billable" + ((item.isbillable == "1")?' active':'')} onTouchTap={this._SetBillable.bind(this,item.id,!(item.isbillable=="1"))}>attach_money</button>
												</div>
								        		<div className="title">{title}</div>
								        		<div className="timer">{item['hours'].toString()}h{TwistUtilities.ZeroPad(item['minutes'],2 )}m</div>
								        		<div className="buttons">
									        		<button onTouchTap={this._StartTaskTimer.bind(this, item['todo-item-id'])} className="material-icons">play_arrow</button>
									        		<button onTouchTap={TimeActions.DeleteTimeEntry.bind(this,item.id)} className="material-icons">delete</button>
									        	</div>
												<div className="details">
													{item[ 'company-name' ]} / <a href={ApplicationStore.getData().user_account.URL + 'projects/' + item[ 'project-id' ].toString() + '/time'} target="teamwork">{item['project-name']}</a> / {time.format( 'HH:mm' )} - {time.add(item.hours,'hours').add(item.minutes,'minutes').format( 'HH:mm' )}
												</div>
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
					<div className="buttons"><button className="material-icons" onTouchTap={this._ShowAddForm}>add</button></div>
				</div>
				{list}
			</div>
		);
	}

});


module.exports = TimeComponent;