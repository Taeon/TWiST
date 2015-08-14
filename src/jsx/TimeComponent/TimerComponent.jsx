var React   = require('react');
var Reflux   = require('reflux');
var moment   = require('moment');

var TimeStore = require( './TimeStore' );
var TimeActions = require( './TimeActions' );

var Utilities = require( '../../js/TwistUtilities.js' );

var Component = React.createClass({

	timer_interval: null,

    getInitialState:function(){
        return {
            seconds: null
        }        
    },

	componentDidMount: function() {
		this.UpdateTimer();
    },
    componentWillUnmount: function() {
        clearTimeout(this.timer_interval);
    },
    UpdateTimer:function(){
        this.setState( {seconds:moment().unix() - TimeStore.getState().current_timer_start_time.unix()} );
		if( TimeStore.getState().current_timer_start_time != null ){
	    	this.timer_interval = setTimeout( function(){ this.UpdateTimer() }.bind(this), 1000 );
		}
    },
	render: function() {

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


    	var seconds = this.state.seconds;
    	var time = Math.floor( seconds / 3600 ).toString() + ':' + TwistUtilities.ZeroPad(( Math.floor( seconds / 60 ) % 60 ).toString(),2) + ':' + TwistUtilities.ZeroPad((seconds % 60).toString(), 2);
    	document.title = time + ' - ' + title;

    	return <div className="item current_timer">
    		<div className="title">{title}</div><div className="timer">{time}</div>
    		<div className="buttons">
        		<button onTouchTap={TimeActions.StopTimer} className="material-icons">stop</button>
        		<button onTouchTap={TimeActions.DeleteTimer}className="material-icons">delete</button>
        	</div>
			<div className="details">{TimeStore.getState().current_timer_details[ 'project-name' ]} / {TimeStore.getState().current_timer_details[ 'company-name' ]} / {TimeStore.getState().current_timer_start_time.format('HH:mm')} -</div>
    	</div>;
	}

});


module.exports = Component;