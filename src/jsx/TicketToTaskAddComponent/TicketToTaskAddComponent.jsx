var React   = require('react');
var Reflux   = require('reflux');
var moment   = require('moment');

var 
	ProjectsStore = require( '../Projects/ProjectsStore' )
	ApplicationStore = require( '../Application/ApplicationStore' );
	;

var TimeActions = require( '../TimeComponent/TimeActions' );
var TasksActions = require(  '../TasksComponent/TasksActions' );

var LocalStorageActions = require(  '../LocalStorage/LocalStorageActions' );
var LocalStorageStore = require(  '../LocalStorage/LocalStorageStore' );

var TwistUtilities = require( '../../js/TwistUtilities' );

var Form = require('react-formal'), 
	yup = require('yup');
	Form.addInputTypes( require('react-formal-inputs') ),
	ReactWidgets = require( 'react-widgets' );

var Combobox = ReactWidgets.Combobox;

var defaultStr = yup.string().default('');

var modelSchema = yup.object(
	{
	    content: yup.string().required( 'You must enter a content' ),
		project_id: yup.string().required('You must select a project'),
		billable: yup.bool()
	}
);


var value = {
    content: '',
	project_id: '',
	task_list_id: null,
	priority: ''
};
var Component = React.createClass({

	STATUS_LOADING: 'loading',
	STATUS_LOADED: 'loaded',

	priorities:[
		{
			id: '',
			name: 'None'
		},
		{
			id: 'low',
			name: 'Low'
		},
		{
			id: 'medium',
			name: 'Medium'
		},
		{
			id: 'high',
			name: 'High'
		},
	],

	getInitialState:function(){
		return {
			task_lists:[],
			status: this.STATUS_LOADING
		}
	},

	onStatusChange:function(){
		this.forceUpdate();
	},
	componentWillMount: function() {
    	this.ResetValues();
		ApplicationStore.getData().teamwork_desk_api.GetTicket( 
			this.props.ticket_id
		).then(
			function( data ){
				var ticket = data.ticket;
				var project_id = LocalStorageStore.GetEmailToProjectLookup( ticket.customer.email );
				if( project_id != null ){
					this.onChange( {project_id:project_id} );
				}
				value.content = ticket.subject + ' (#' + ticket.id + ')';
				this.setState( {
					status:this.STATUS_LOADED,
					ticket: ticket
				} );
			}.bind(this)
		)
    },
    componentWillUnmount: function() {
    	this.ResetValues();
    },
	onSubmit:function(){
		var task = {
			project_id: value.project_id,
			content: value.content,
			priority: value.priority,
			'responsible-party-id': ApplicationStore.getData().user_account.userId
		}


		ApplicationStore.getData().teamwork_api.CreateTask( 
			value.task_list_id,
		 	{'todo-item':task}
		 ).then(
		 	function( task ){
				setTimeout(
					function(){
						ApplicationStore.getData().teamwork_desk_api.SetTicketTaskID(
							this.state.ticket.id,
							task.id
						).then(
							function(){
								TasksActions.UpdateTasks();
							}.bind(this)
						);					
					}.bind(this),
					1000
					
				)
		 	}.bind(this)
		 );

		LocalStorageActions.SetEmailToProjectLookup( this.state.ticket.customer.email, value.project_id );

		if( typeof this.props.onSubmit == 'function' ){
		 	this.props.onSubmit();
		}
	},
	ResetValues:function(){
		for( var index in value ){
			value[ index ] = '';
		}
	},
	onChange:function( new_values ){
		for( var index in new_values ){
			value[ index ] = new_values[ index ];
		}
		if( typeof new_values.project_id != 'undefined' ){
			ApplicationStore.getData().teamwork_api.GetProjectTaskLists( 
			 	new_values.project_id
			 ).then(
			 	function( data ){
			 		value.task_list_id = '';
			 		this.refs.task_list_id.setState( {value:''} )
			 		this.setState( {task_lists:data.tasklists} );
			 	}.bind(this)
			 );
		}
	},
	onBillableChange:function(){
		value.billable = React.findDOMNode( this.refs.myFormBillable ).checked;
	},
	render: function() {

		if( this.state.status == this.STATUS_LOADING ){
			return <div>Loading...</div>;
		}

		var companies = [];
		var projects_by_company = {};
		var projects = ProjectsStore.getState().projects;
		for( var i = 0; i < projects.length; i++ ){
			var project = projects[ i ];
			project.company_name = project.company.name;
			if( companies.indexOf( project.company.name ) === -1 ){
				companies.push( project.company.name );
				projects_by_company[ project.company.name ] = [];
			}
			projects_by_company[ project.company.name ].push( project );
		}
		companies.sort();

		var hours = [];
		for( var i = 0; i <= 24; i++ ){
			hours.push( TwistUtilities.ZeroPad( i, 2 ) );
		}
		var minutes = [];
		for( var i = 0; i <= 60; i++ ){
			minutes.push( TwistUtilities.ZeroPad( i, 2 ) );
		}

		var task_lists = this.state.task_lists;
		if( task_lists.length == 1 ){
			value.task_list_id = task_lists[ 0 ].id;
		}

		return <Form 
				  className="time-entry-edit"
				  	ref = "myForm"
				    schema={modelSchema}
				    defaultValue={modelSchema.default()}
				    onSubmit={this.onSubmit}
				    value={value}
				    onChange={this.onChange}
				  >
				    <div className="row">
				      <label>Description</label>
				      <Form.Field name='content' className="text"/>
				      <Form.Message for='content'/>
				    </div>
				    <div className="row">
					    <label>Project</label>

						<Combobox 
						      data={projects}
						      defaultValue={value.project_id}
						      textField='name' 
						      valueField='id'
						      groupBy='company_name'
						      onChange={function(project){if(typeof project == 'object' ){this.onChange({project_id:project.id})}}.bind(this)}
						      filter='contains'
						      />
					    <Form.Message for='project_id'/>
				   </div>
				    <div className="row">
					    <label>Task List</label>

						<Combobox 
						      data={task_lists}
						      defaultValue={value.task_list_id}
						      textField='name' 
						      valueField='id'
						      ref='task_list_id'
						      onChange={function(task_list){if(typeof task_list == 'object' ){this.onChange({task_list_id:task_list.id})}}.bind(this)}
						      />
					    <Form.Message for='task_list_id'/>
				    </div>
				    <div className="row">
					    <label>Priority</label>

						<Combobox 
						      data={this.priorities}
						      defaultValue={value.priority}
						      textField='name' 
						      valueField='id'
						      onChange={function(priority){if(typeof priority == 'object' ){this.onChange({priority:priority.id})}}.bind(this)}
						      filter='contains'
						      />
					    <Form.Message for='priority'/>
				    </div>
				  <Form.Button type='submit' className="submit">Submit</Form.Button>
				</Form>;
	}

});


module.exports = Component;