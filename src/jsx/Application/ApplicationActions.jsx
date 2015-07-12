'use strict';

var Reflux = require('reflux');

var TeamworkAPI = require('../../../bower_components/teamwork-api/src/teamwork-api');
var TeamworkDeskAPI = require('../../../bower_components/teamwork-api/src/teamwork-desk-api');
var teamwork_api = null;
var teamwork_desk_api = null;

// Create a Reflux actions object with basic actions for reloading posts
// and deleting a post
var Actions = Reflux.createActions({
    'SetAPIKey':{children:["completed","failed"],asyncResult:true},
    'Logout':{},

    'GetTasks':{children:["completed","failed"],asyncResult:true},
    'GetTask':{children:["completed","failed"],asyncResult:true},
    'SetTasksCompleted':{children:["completed","failed"],asyncResult:true},

    'GetTicketsMine':{children:["completed","failed"],asyncResult:true},
    'GetTicketsUnassigned':{children:["completed","failed"],asyncResult:true},

    'GetTimeEntry':{children:["completed","failed"],asyncResult:true},
    'GetTimes':{children:["completed","failed"],asyncResult:true},
    'CreateTimeEntry':{children:["completed","failed"],asyncResult:true},
    'UpdateTimeEntry':{children:["completed","failed"],asyncResult:true},
    'DeleteTimeEntry':{children:["completed","failed"],asyncResult:true},

    'StartTaskTimer':{children:["completed","failed"],asyncResult:true},

    'SwitchToTwist':{},
    'SwitchToTeamwork':{},
    'SetTeamworkURL':{},
//    'SwitchToTeamworkDesk':{},
 //   'SetTeamworkDeskURL':{}
});

/**
 * Attempt to connect to Teamwork
 */
Actions.SetAPIKey.listen(
    function( api_key ){
        teamwork_api = new TeamworkAPI(
            api_key,
            {
                complete: function( data ){ 
                    teamwork_desk_api = new TeamworkDeskAPI(
                        api_key,
                        {
                            base_url:teamwork_api.GetBaseURL()
                        }
                    );
                    this.completed(
                        api_key,
                        data.account
                    );
                }.bind(this)
            }
        );
    }
);
Actions.GetTasks.listen(
    function( options ){
        teamwork_api.GetTasks( options ).then( this.completed );
    }
);
Actions.GetTask.listen(
    function( id ){
        teamwork_api.GetTask( id ).then( this.completed );
    }
);
Actions.SetTasksCompleted.listen(
    function( ids ){
        var total = ids.length;
        for( var i = 0; i < ids.length; i++ ){
            teamwork_api.SetTaskCompleted( ids[ i ] ).then(
                function(){
                    total--;
                    if( total <= 0 ){

                        this.completed();
                    }
                }.bind(this)
            );
        }
    }
);
Actions.GetTicketsMine.listen(
    function( options ){
       teamwork_desk_api.SearchTickets( options ).then( this.completed );
    }
);
Actions.GetTicketsUnassigned.listen(
    function( options ){
        teamwork_desk_api.SearchTickets( options ).then( this.completed );
    }
);
Actions.GetTimeEntry.listen(
    function( id, options ){
        teamwork_api.GetTimeEntry( id, options ).then( this.completed );
    }
);
Actions.GetTimes.listen(
    function( options ){
        teamwork_api.GetTimeEntries( options ).then( this.completed );
    }
);
Actions.CreateTimeEntry.listen(
    function( options ){
        if( options.project_id != null ){
            delete options.task_id;
            teamwork_api.CreateTimeEntryForProject( options.project_id, {'time-entry':options} ).then( this.completed );
        } else {
            delete options.project_id;
            teamwork_api.CreateTimeEntryForTask( options.task_id, {'time-entry':options} ).then( this.completed );
        }
    }
);
Actions.UpdateTimeEntry.listen(
    function( id, options ){
        teamwork_api.UpdateTimeEntry( id, {'time-entry':options} ).then( this.completed );
    }
);
Actions.DeleteTimeEntry.listen(
    function( time_entry_id ){
        teamwork_api.DeleteTimeEntry( time_entry_id ).then( this.completed );
    }
);

// Export the actions
module.exports = Actions;