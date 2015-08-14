'use strict';

var Reflux = require('reflux'),
    LocalStorageActions = require('../LocalStorage/LocalStorageActions'),
    LocalStorageStore = require('../LocalStorage/LocalStorageStore'),
    TimeState = require('./TimeState'),
    TimeActions = require('./TimeActions'),
    ApplicationActions = require('../Application/ApplicationActions'),
    ApplicationStore = require('../Application/ApplicationStore');

var moment   = require('moment');

// Export a new Reflux store
module.exports = Reflux.createStore({
    mixins: [TimeState,Reflux.ListenerMixin],

    listenables: TimeActions,

    init:function(){
        ApplicationStore.listen(
            function( data ){
                // If we haven't loaded times list yet...
                if(
                    this.getState().status == this.STATE_UNINITIALIZED 
                    &&
                    ApplicationStore.getData().state == ApplicationStore.STATE_LOADED
                ){
                    this.setState( {status:this.STATE_LOADING} );
                    this.UpdateTimes();
                    var timer = LocalStorageStore.getData().current_timer;
                    if( typeof timer != 'undefined' && timer ){
                        this.setState( 
                            {
                                current_timer_start_time: moment.unix(timer.current_timer_start_time),
                                current_timer_details: timer.current_timer_details,
                                current_timer_type: timer.current_timer_type,
                            }
                        );
                    }
                }
            }.bind(this)
        );
    },
    UpdateTimes:function() {
        ApplicationActions.GetTimes(
            {
                userId:ApplicationStore.getData().user_account.userId,
                fromDate: moment().subtract( 7, 'days' ).format( 'YYYYMMDD' ),
                sortOrder: 'DESC'
            }
        ).then(
            function( data ){
                this.setState( 
                    {
                        status: this.STATE_OK,
                        times: data[ 'time-entries' ]
                    }
                );
            }.bind(this)
        )
    },

    StartTaskTimer:function( task ){
        // Stop and store current timer, if necessary
        this.StopTimer();
        task.billable = true;
        var data =             {
                current_timer_start_time: moment(),
                current_timer_details:task,
                current_timer_type:'task'
            };
        this.setState(
            data
        );
        LocalStorageActions.Set(
            'current_timer',
            {
                current_timer_start_time:data.current_timer_start_time.unix(),
                current_timer_details:task,
                current_timer_type:'task'
            }
        );
    },

    StartTimeEntryTimer:function( time_entry ){

        // Stop and store current timer, if necessary
        this.StopTimer();
        var data =             {
                current_timer_start_time: moment(),
                current_timer_details:time_entry,
                current_timer_type:'time_entry'
            };
        this.setState(
            data
        );
        LocalStorageActions.Set(
            'current_timer',
            {
                current_timer_start_time:data.current_timer_start_time.unix(),
                current_timer_details:time_entry,
                current_timer_type:'time_entry'
            }
        );
    },
    StopTimer:function(){

        if( this.getState().current_timer_start_time == null ){
            return;
        }
// Record the time
        var seconds = moment().unix() - this.getState().current_timer_start_time.unix();

        var task_id;
        var project_id;
        var description = '';
        switch( this.getState().current_timer_type ){
            case 'task':{
                task_id = this.getState().current_timer_details.id;
                break;
            }
            case 'time_entry':{
                project_id = this.getState().current_timer_details.project_id;
                description = this.getState().current_timer_details.description;
                break;
            }
        }
        ApplicationActions.CreateTimeEntry(
            {
                'project_id': project_id,
                'task_id': task_id,
                'description': description,
                'hours': Math.floor( seconds / 3600 ),
                'minutes': Math.ceil( seconds / 60 ) % 60,
                'person-id': ApplicationStore.getData().user_account["userId"],
                'time': this.getState().current_timer_start_time.format( 'HH:mm' ),
                'date': this.getState().current_timer_start_time.format( 'YYYYMMDD' ),
                'isBillable': ((this.getState().current_timer_details.billable)?1:0)
            }
        ).then(
            this.UpdateTimes.bind(this)
        );
// Clear the timer
        this.DeleteTimer();
    },
    DeleteTimer:function(){
        this.setState(
            {
                current_timer_start_time: null,
                current_timer_details:null,
                current_timer_type:null
            } 
        );
        LocalStorageStore.Delete( 'current_timer' );
    },
    DeleteTimeEntry:function( time_entry_id ){
if( confirm( 'Are you sure you want to delete this time entry?' ) ){
        ApplicationActions.DeleteTimeEntry( time_entry_id ).then( this.UpdateTimes.bind(this) );
}

    },
    getState: function(){
        return this.state;
    }
});