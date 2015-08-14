var React   = require('react');
var Reflux   = require('reflux');

var TasksStore = require( './TasksStore' );
var TasksActions = require( './TasksActions' );

var TimeActions = require( '../TimeComponent/TimeActions' );

var TicketsActions = require( '../TicketsComponent/TicketsActions' );
var ApplicationStore = require( '../Application/ApplicationStore' );

var Utilities = require( '../../js/TwistUtilities.js' );

var TasksComponent = React.createClass({

	task_priority_class_names:{
		'low':'priority-low',
		'medium':'priority-medium',
		'high':'priority-high',
	},

	componentDidMount: function() {
        this.unsubscribe = TasksStore.listen(function(){this.forceUpdate()}.bind(this));
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },
  
	_StartTaskTimer:function( task_id ){
		ApplicationStore.getData().teamwork_api.GetTask( task_id ).then(
			function( data ){
				TimeActions.StartTaskTimer( data[ 'todo-item' ] );
			}
		);
	},
	_MarkCompleted:function(){
		var total = TasksStore.getState().tasks_checked.length;
		if( total > 0 ){
			var ids = TasksStore.getState().tasks_checked;
	        for( var i = 0; i < ids.length; i++ ){
	            ApplicationStore.getData().teamwork_api.SetTaskCompleted( ids[ i ] ).then(
	                function(){
	                    total--;
	                    if( total <= 0 ){
							TasksStore.UpdateTasks();
	                    }
	                }.bind(this)
	            );
	        }
		}
	},
	_ToggleChecked:function( id ){
		var tasks_checked = TasksStore.getState().tasks_checked;
		var index = tasks_checked.indexOf( id );
		if( index === -1 ){
			tasks_checked.push( id );
		} else {
			tasks_checked.splice( index, 1 );
		}
		this.setState(
			{
				tasks_checked: tasks_checked
			}
		);
	},
	_Reload:function(){
		TasksActions.UpdateTasks();
	},
	onTaskClick:function( id ){
alert(id);
	},



	render: function() {
		var list;
		if( TasksStore.getState().status == TasksStore.STATE_LOADING ){
			list = <div className="waiting">...</div>;
		} else {
			var inner_content = '';
			if( TasksStore.getState().tasks.length == 0 ){
				inner_content = <div className="none">No tasks to show</div>;
			} else {
				inner_content = <div className="tasks-items">{TasksStore.getState().tasks.map(
					function (item, idx) {


						return <div className={"item task " + ((item.priority != '')?this.task_priority_class_names[ item.priority]:'priority-none') }
							key={idx}>
								<div style={{backgroundColor:Utilities.StringToRGB(item['company-name'])}} className="marker"></div>
								<div style={{backgroundColor:Utilities.StringToRGB(item['project-name'])}} className="marker project"></div>
								<label><input type="checkbox" checked={TasksStore.getState().tasks_checked.indexOf(item.id)!==-1} className="checkbox" onChange={this._ToggleChecked.bind(this,item.id)}/></label>
								<div className="title"><a href={ApplicationStore.getData().user_account.URL + 'tasks/' + item.id.toString() } target="teamwork">{item.content}</a></div>
								<div className={"time" + ((typeof item.time_totals != 'undefined' && parseInt( item.time_totals['total-mins-sum'], 10 ) > 0)?' logged':'')}>{(typeof item.time_totals != 'undefined')?'' + Utilities.MinutesToTime( item.time_totals['total-mins-sum'] ):''}</div>
								<div className="details">
									{item['company-name']} / <a href={ApplicationStore.getData().user_account.URL + 'projects/' + item[ 'project-id' ].toString() + '/tasks'} target="teamwork">{item['project-name']}</a> / <a href={ApplicationStore.getData().user_account.URL + 'tasklists/' + item[ 'todo-list-id' ].toString()} target="teamwork">{item['todo-list-name']}</a>
								</div>
								<div className="description">{item['description']}</div>
				        		<div className="buttons">
					        		<button onTouchTap={this._StartTaskTimer.bind(this, item.id)} className="material-icons">access_time</button>
					        	</div>
							</div>;
					}.bind(this)
					
				)}</div>;
			}
		}

		return (
			<div id="tasks">
				<div className="header">
					<h2><a href={ApplicationStore.getData().user_account.URL + 'people/' + ApplicationStore.getData().user_account.userId +'?tabView=tasks'} target="teamwork">Tasks [{TasksStore.getState().tasks.length}]</a></h2>
					<div className="buttons"><button className="material-icons" onTouchTap={this._Reload}>replay</button><button className="material-icons">add</button></div>
					<div className="options"><div className="buttons"><button className="material-icons" onTouchTap={this._MarkCompleted}>done_all</button></div></div>
				</div>
				{inner_content}
			</div>
		);
	}

});

module.exports = TasksComponent;