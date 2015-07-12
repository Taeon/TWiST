/** @jsx React.DOM */

var React   = require('react');
var Reflux   = require('reflux');
var moment   = require('moment');

var ProjectsStore = require( '../Projects/ProjectsStore' );
var TimeEntryAddStore = require( './TimeEntryAddStore' );
var TimeEntryAddActions = require( '../TimeEntryAddComponent/TimeEntryAddActions' );

var TimeActions = require( '../TimeComponent/TimeActions' );

var Form = require('react-formal'), 
	yup = require('yup');
	Form.addInputTypes( require('react-formal-inputs') ),
	ReactWidgets = require( 'react-widgets' );

var Combobox = ReactWidgets.Combobox;

var defaultStr = yup.string().default('');

var modelSchema = yup.object(
	{
	    description: yup.string().required( 'You must enter a description' ),
		project_id: yup.string().required('You must select a project'),
		billable: yup.bool()
	}
);


var value = {
    description: '',
	project_id: '',
	billable: false,
	color:false
};
var TimeEntryAddComponent = React.createClass({

	mixins: [Reflux.listenTo(TimeEntryAddStore,"onStatusChange")],
	onStatusChange:function(){
		this.forceUpdate();
	},
	componentDidMount: function() {
    },
    componentWillUnmount: function() {
    },
	_HideAddForm:function(){
		TimeEntryAddActions.HideForm();
	},
	onSubmit:function(){

		var project = ProjectsStore.GetProject( value.project_id );

		var data = {
			description: value.description,
			project_id: value.project_id,
			billable: value.billable,
			'project-name': project.name,
			'company-name': project.company.name
		};

		TimeActions.StartTimeEntryTimer( data );
		this._HideAddForm();	
	},
	onChange:function( new_values ){
		for( var index in new_values ){
			value[ index ] = new_values[ index ];
		}
	},
	onBillableChange:function(){
		value.billable = React.findDOMNode( this.refs.myFormBillable ).checked;
	},
	render: function() {

		if( !TimeEntryAddStore.getState().show  ){
		 	return false;
		} else {

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

			return <div id="time-form-add">
				<div>
					<h2>Add new time entry</h2>
					<div className="buttons"><button className="material-icons" onTouchTap={this._HideAddForm}>clear</button></div>
					  <Form 
					  className="cf"
					  	ref = "myForm"
					    schema={modelSchema}
					    defaultValue={modelSchema.default()}
					    onSubmit={this.onSubmit}
					    value={value}
					    onChange={this.onChange}
					  >
					    <div className="row">
					      <label>Description</label>
					      <Form.Field name='description' className="text"/>
					      <Form.Message for='description'/>
					    </div>
					    <div className="row">
						    <label>Project</label>

							<Combobox 
							      data={projects}
							      defaultValue=''
							      textField='name' 
							      valueField='id'
							      groupBy='company_name'
							      onChange={function(project){if(typeof project == 'object' ){this.onChange({project_id:project.id})}}.bind(this)}
							      filter='contains'
							      />
						    <Form.Message for='project_id'/>
					    </div>
					    <div className="row">
						    <label>Billable</label>
						    <Form.Field type="checkbox" name="billable" ref="myFormBillable" onChange={this.onBillableChange}/>
						</div>
					  <Form.Button type='submit' className="submit">Submit</Form.Button>
					</Form>

				</div>
			</div>;

		}
	}

});


module.exports = TimeEntryAddComponent;