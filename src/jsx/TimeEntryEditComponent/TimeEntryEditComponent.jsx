var React   = require('react');
var Reflux   = require('reflux');
var moment   = require('moment');

var 
	ProjectsStore = require( '../Projects/ProjectsStore' )
	ApplicationStore = require( '../Application/ApplicationStore' );
	;

var TimeActions = require( '../TimeComponent/TimeActions' );

var TwistUtilities = require( '../../js/TwistUtilities' );

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
	time_start_hours:'00',
	time_start_minutes:'00',
	time_end_hours:'00',
	time_end_minutes:'00'
};
var TimeEntryAddComponent = React.createClass({

	STATUS_LOADING: 'loading',
	STATUS_LOADED: 'loaded',

	getInitialState:function(){
		return {
			status: this.STATUS_LOADING
		}
	},

	onStatusChange:function(){
		this.forceUpdate();
	},
	componentWillMount: function() {
		ApplicationStore.getData().teamwork_api.GetTimeEntry( 
			this.props.time_entry_id
		).then(
			function( data ){
				var time_entry = data[ 'time-entry' ];
				if( time_entry[ 'todo-item-id' ] != '' ){
					value.description = time_entry[ 'todo-item-name' ];
				} else {
					value.description = time_entry[ 'description' ];
				}
				value.project_id = time_entry[ 'project-id' ];
				var time = moment( time_entry.date, moment.ISO_8601 );
				value.time_start_hours = time.format( 'HH' );
				value.time_start_minutes = time.format( 'mm' );
				time.add( parseInt( time_entry.hours, 10 ), 'hours' )
				time.add( parseInt( time_entry.minutes, 10 ), 'minutes' )
				value.time_end_hours = time.format( 'HH' );
				value.time_end_minutes = time.format( 'mm' );
				value.billable = ( time_entry[ 'isbillable' ] == '1' );
				this.setState( {
					status:this.STATUS_LOADED,
					time_entry: time_entry
				} );
			}.bind(this)
		)

		// for( var index in this.props.time_entry ){
		// 	value[ index ] = this.props.time_entry[ index ];
		// }
    },
    componentWillUnmount: function() {
    },
	onSubmit:function(){
		var project = ProjectsStore.GetProject( value.project_id );

		var time_entry = {};
		for( var index in this.state.time_entry ){
			time_entry[ index ] = this.state.time_entry[ index ];
		}
		time_entry.description = value.description;
		time_entry.project_id = value.project_id;
		time_entry.billable = value.billable;
		time_entry[ 'project-name' ] = project.name;
		time_entry[ 'company-name' ] = project.company.name;

		var start_time = moment( this.state.time_entry.date, moment.ISO_8601 );
		start_time.minutes( parseInt( value.time_start_minutes, 10 ) );
		start_time.hours( parseInt( value.time_start_hours, 10 ) );

		time_entry.date = start_time.format( 'YYYYMMDD' );

		var end_time = moment( this.state.time_entry.date, moment.ISO_8601 );
		end_time.minutes( parseInt( value.time_end_minutes, 10 ) );
		end_time.hours( parseInt( value.time_end_hours, 10 ) ) ;

		time_entry.time = start_time.format( 'HH:mm' );

		time_entry.minutes = Math.floor( ( end_time.unix() - start_time.unix() ) / 60 ) % 60;
		time_entry.hours = Math.floor( ( end_time.unix() - start_time.unix() ) / 3600 );

		ApplicationStore.getData().teamwork_api.UpdateTimeEntry( 
		 	time_entry.id,
		 	{'time-entry':time_entry}
		 );

		if( typeof this.props.onSubmit == 'function' ){
		 	this.props.onSubmit();
		}
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
				      <Form.Field name='description' className="text"/>
				      <Form.Message for='description'/>
				    </div>
				    <div className="row">
					    <label>Start Time</label>

						<Combobox 
						      data={hours}
						      defaultValue={value.time_start_hours}
						      className="time hours"
						      onChange={function(value){this.onChange({time_start_hours:value})}.bind(this)}
						      />
						<Combobox 
						      data={minutes}
						      defaultValue={value.time_start_minutes}
						      className="time minutes"
						      onChange={function(value){this.onChange({time_start_minutes:value})}.bind(this)}
						      />
					    <Form.Message for='project_id'/>
				    </div>
				    <div className="row">
					    <label>End Time</label>

						<Combobox 
						      data={hours}
						      defaultValue={value.time_end_hours}
						      className="time hours"
						      onChange={function(value){this.onChange({time_end_hours:value})}.bind(this)}
						      />
						<Combobox 
						      data={minutes}
						      defaultValue={value.time_end_minutes}
						      className="time minutes"						      
						      onChange={function(value){this.onChange({time_end_minutes:value})}.bind(this)}
						      />
					    <Form.Message for='project_id'/>
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
					    <label>Billable</label>
					    <Form.Field type="checkbox" name="billable" ref="myFormBillable" checked={value.billable} onChange={this.onBillableChange}/>
					</div>
				  <Form.Button type='submit' className="submit">Submit</Form.Button>
				</Form>;
	}

});


module.exports = TimeEntryAddComponent;